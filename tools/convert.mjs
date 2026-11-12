// Converts the design tool's x-dc screen templates into React class components.
// usage: node convert.mjs <cleanDir> <outDir> <mapJson>
import fs from "node:fs";
import path from "node:path";
import { parse } from "parse5";

const [, , SRC, OUT, MAP] = process.argv;
const { screens, routes } = JSON.parse(fs.readFileSync(MAP, "utf8"));
fs.mkdirSync(OUT, { recursive: true });

const ATTR = {
  class: "className", for: "htmlFor", tabindex: "tabIndex", readonly: "readOnly", maxlength: "maxLength",
  autocomplete: "autoComplete", inputmode: "inputMode", colspan: "colSpan", rowspan: "rowSpan",
  autofocus: "autoFocus", spellcheck: "spellCheck", enterkeyhint: "enterKeyHint", "xlink:href": "href",
  "xml:space": "xmlSpace", "xmlns:xlink": "xmlnsXlink", minlength: "minLength", autocapitalize: "autoCapitalize",
  contenteditable: "contentEditable", crossorigin: "crossOrigin", datetime: "dateTime", srcset: "srcSet",
};
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const NO_WS = new Set(["svg", "g", "defs", "lineargradient", "radialgradient", "table", "thead", "tbody", "tfoot", "tr", "select", "clippath", "mask", "pattern", "filter", "ul", "ol"]);
const VOID = new Set(["br", "hr", "img", "input", "meta", "link", "area", "col", "source", "wbr"]);

const css = new Set();
const unknownLinks = new Set();

function expr(e, scope) {
  e = e.trim();
  if (!/^[A-Za-z_$][\w$]*(\.[\w$]+)*$/.test(e)) {
    if (/^(true|false|null|\d+(\.\d+)?)$/.test(e)) return e;
    throw new Error("Unsupported expression: " + e);
  }
  const [head, ...rest] = e.split(".");
  const base = scope.has(head) ? head : "$." + head;
  return rest.length ? base + rest.map((r) => "?." + r).join("") : base;
}

// "a {{x}} b" -> JS expression string
function interp(str, scope) {
  const parts = str.split(/({{[^}]*}})/).filter((p) => p !== "");
  if (parts.length === 1 && /^{{.*}}$/.test(parts[0])) return expr(parts[0].slice(2, -2), scope);
  return "`" + parts.map((p) => (/^{{.*}}$/.test(p) ? "${" + expr(p.slice(2, -2), scope) + " ?? ''}" : p.replace(/[`\\$]/g, (m) => "\\" + m))).join("") + "`";
}

function styleObj(str, scope) {
  // split on ; not inside parentheses or quotes
  const decls = [];
  let depth = 0, cur = "", q = null;
  for (const ch of str) {
    if (q) { if (ch === q) q = null; cur += ch; continue; }
    if (ch === "'" || ch === '"') { q = ch; cur += ch; continue; }
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === ";" && depth === 0) { decls.push(cur); cur = ""; continue; }
    cur += ch;
  }
  decls.push(cur);
  const out = [];
  for (const d of decls) {
    const i = d.indexOf(":");
    if (i < 0) continue;
    let prop = d.slice(0, i).trim();
    const val = d.slice(i + 1).trim();
    if (!prop) continue;
    const key = prop.startsWith("--") ? JSON.stringify(prop) : prop.startsWith("-webkit-") ? "Webkit" + camel(prop.slice(7)).replace(/^./, (c) => c.toUpperCase()) : camel(prop);
    const v = val.includes("{{") ? interp(val, scope) : JSON.stringify(val);
    out.push(key + ": " + v);
  }
  return "{{ " + out.join(", ") + " }}";
}

function linkTarget(href) {
  const m = /^([A-Za-z]+)\.dc\.html$/.exec(href);
  if (!m) return null;
  if (!routes[m[1]]) { unknownLinks.add(m[1]); return null; }
  return routes[m[1]];
}

function attrs(node, scope, tag) {
  const out = [];
  let to = null;
  for (const a of node.attrs) {
    let name = a.name, val = a.value;
    if (name.startsWith("hint-")) continue;
    if (name.startsWith("sc-camel-")) name = camel(name.slice(9));
    else if (ATTR[name]) name = ATTR[name];
    else if (name.includes("-") && !name.startsWith("aria-") && !name.startsWith("data-")) name = camel(name);
    if (name === "href" && tag === "a") {
      const t = linkTarget(val);
      if (t) { to = t; continue; }
    }
    if (name === "style") { out.push("style=" + styleObj(val, scope)); continue; }
    if (tag === "input" || tag === "textarea" || tag === "select") {
      const hasHandler = node.attrs.some((x) => /on-change|on-input/.test(x.name));
      if (name === "value" && !val.includes("{{") && !hasHandler) name = "defaultValue";
      if (name === "checked" && !val.includes("{{") && !hasHandler) name = "defaultChecked";
    }
    if (val.includes("{{")) out.push(name + "={" + interp(val, scope) + "}");
    else if (val === "" && /^(disabled|checked|defaultChecked|readOnly|hidden|autoFocus|required|multiple|selected|open)$/.test(name)) out.push(name);
    else out.push(name + "=" + JSON.stringify(val));
  }
  return { list: out, to };
}

function text(t, parentTag, scope) {
  if (parentTag === "pre") return t.split(/({{[^}]*}})/).filter(Boolean).map((p) => (/^{{.*}}$/.test(p) ? "{" + expr(p.slice(2, -2), scope) + "}" : "{" + JSON.stringify(p) + "}")).join("");
  if (!t.trim()) return NO_WS.has(parentTag) ? "" : t.includes("\n") ? '{" "}' : "{" + JSON.stringify(t.replace(/\s+/g, " ")) + "}";
  const norm = t.replace(/\s+/g, " ");
  return norm.split(/({{[^}]*}})/).filter(Boolean).map((p) => (/^{{.*}}$/.test(p) ? "{" + expr(p.slice(2, -2), scope) + "}" : "{" + JSON.stringify(p) + "}")).join("");
}

let loopN = 0;
function children(node, scope, parentTag) {
  const nodes = node.content ? node.content.childNodes : node.childNodes || [];
  return nodes.map((c) => el(c, scope, parentTag)).join("");
}

function el(node, scope, parentTag) {
  if (node.nodeName === "#text") return text(node.value, parentTag, scope);
  if (node.nodeName === "#comment") return "";
  let tag = node.tagName;
  if (tag === "helmet") {
    for (const s of node.childNodes) if (s.tagName === "style") css.add(s.childNodes.map((t) => t.value).join(""));
    return "";
  }
  if (tag === "sc-for") {
    const list = node.attrs.find((a) => a.name === "list").value;
    const as = node.attrs.find((a) => a.name === "as").value;
    const idx = "i" + loopN++;
    const inner = new Set(scope); inner.add(as);
    return "{(" + interp(list, scope) + " || []).map((" + as + ", " + idx + ") => (<Fragment key={" + idx + "}>" + children(node, inner, parentTag) + "</Fragment>))}";
  }
  if (tag === "sc-if") {
    const v = node.attrs.find((a) => a.name === "value").value;
    return "{" + interp(v, scope) + " ? (<>" + children(node, scope, parentTag) + "</>) : null}";
  }
  if (tag.startsWith("sc-raw-")) tag = tag.slice(7);
  if (tag.startsWith("sc-")) throw new Error("Unknown directive " + tag);
  // SVG camel-cased tags that parse5 lowercases
  const SVG_TAGS = { lineargradient: "linearGradient", radialgradient: "radialGradient", clippath: "clipPath", textpath: "textPath", feturbulence: "feTurbulence", fegaussianblur: "feGaussianBlur", fecolormatrix: "feColorMatrix", foreignobject: "foreignObject" };
  const jtag = SVG_TAGS[tag] || tag;
  const { list, to } = attrs(node, scope, tag);
  const open = to ? "Link to=" + JSON.stringify(to) : jtag;
  const close = to ? "Link" : jtag;
  const a = list.length ? " " + list.join(" ") : "";
  if (VOID.has(tag)) return "<" + open + a + " />";
  if (tag === "style") return "<style>{" + JSON.stringify(node.childNodes.map((t) => t.value).join("")) + "}</style>";
  const kids = children(node, scope, tag);
  return "<" + open + a + ">" + kids + "</" + close + ">";
}

const index = [];
for (const [file, s] of Object.entries(screens)) {
  const src = fs.readFileSync(path.join(SRC, file), "utf8");
  const doc = parse(src);
  const find = (n, t) => { if (n.tagName === t) return n; for (const c of n.childNodes || []) { const r = find(c, t); if (r) return r; } return null; };
  const xdc = find(doc, "x-dc");
  const scriptM = /<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/.exec(src);
  let logic = scriptM ? scriptM[1].trim() : "class Component extends DCLogic {}";
  if (!/class Component extends DCLogic/.test(logic)) throw new Error("no Component in " + file);
  logic = logic.replace("class Component extends DCLogic", "class Logic extends DCLogic");

  // Root element: fill the app viewport instead of a fixed 390x844 artboard.
  const root = xdc.childNodes.find((c) => c.tagName && c.tagName !== "helmet");
  const st = root.attrs.find((a) => a.name === "style");
  st.value = st.value.replace(/width:390px;height:844px;/, "width:100%;height:100%;");
  if (!/width:100%;height:100%;/.test(st.value)) throw new Error("root size not found in " + file);

  loopN = 0;
  const jsx = children(xdc, new Set(), "x-dc");
  const code = `/* eslint-disable */
// Generated from the ALKE Network App design (${file}). Edit the logic freely;
// the markup mirrors the design board one-to-one.
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { DCLogic } from "../dc";

${logic}

export default class ${s.name} extends Logic {
  render() {
    const $ = this.vals();
    return (<>${jsx}</>);
  }
}
`;
  fs.writeFileSync(path.join(OUT, s.name + ".jsx"), code);
  index.push(s.name);
}
fs.writeFileSync(path.join(OUT, "screens.css"), [...css].join("\n").replace(/body\{margin:0\}\s*/g, "").replace(/a\{color:#C6B6FF\}a:hover\{color:#F7F5F2\}\s*/g, ""));
console.log("converted", index.length, "screens");
if (unknownLinks.size) console.log("unmapped links:", [...unknownLinks].join(", "));
