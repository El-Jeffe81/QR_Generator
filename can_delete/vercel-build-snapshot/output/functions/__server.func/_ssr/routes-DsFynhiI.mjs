import { i as __toESM } from "../_runtime.mjs";
import { L as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as QrCode, r as Download, t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as require_browser } from "../_libs/qrcode.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DsFynhiI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_browser = require_browser();
var STORAGE_KEY = "quiet-zone:v1";
var QUIET_MODULES = 4;
var MODULE_MIN = 4;
var MODULE_MAX = 16;
var DEFAULT_FG = "#1b1916";
var DEFAULT_BG = "#f6f3ed";
var LEVELS = [
	{
		id: "L",
		name: "Low",
		recovery: "7%"
	},
	{
		id: "M",
		name: "Medium",
		recovery: "15%"
	},
	{
		id: "Q",
		name: "Quartile",
		recovery: "25%"
	},
	{
		id: "H",
		name: "High",
		recovery: "30%"
	}
];
var SWATCHES = [
	{
		name: "Ink",
		fg: "#1b1916",
		bg: "#f6f3ed"
	},
	{
		name: "Inverse",
		fg: "#f6f3ed",
		bg: "#1b1916"
	},
	{
		name: "Signal",
		fg: "#8e3e1c",
		bg: "#f6f3ed"
	}
];
var HEX = /^#[0-9a-fA-F]{6}$/;
function isEcc(value) {
	return value === "L" || value === "M" || value === "Q" || value === "H";
}
function isHex(value) {
	return typeof value === "string" && HEX.test(value);
}
function channel(hex, index) {
	const value = Number.parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16) / 255;
	return value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
}
function luminance(hex) {
	return .2126 * channel(hex, 0) + .7152 * channel(hex, 1) + .0722 * channel(hex, 2);
}
function contrastRatio(foreground, background) {
	const a = luminance(foreground);
	const b = luminance(background);
	const [hi, lo] = a > b ? [a, b] : [b, a];
	return (hi + .05) / (lo + .05);
}
function scanNote(foreground, background) {
	const ratio = contrastRatio(foreground, background);
	const inverted = luminance(foreground) > luminance(background);
	if (ratio < 3) return `Contrast is ${ratio.toFixed(1)}:1. Darker marks on a lighter field scan more reliably.`;
	if (inverted) return "Light marks on a dark field. Dark-on-light is more reliable on phone cameras.";
	return null;
}
function friendlyError(error) {
	const message = error instanceof Error ? error.message : "Could not build this code.";
	if (/too big|too long/i.test(message)) return "That text is too long for this error correction level. Shorten it, or choose Low.";
	return message;
}
function paint(canvas, text, ecc, foreground, background, modulePx) {
	const symbol = (0, import_browser.create)(text, { errorCorrectionLevel: ecc });
	const modules = symbol.modules.size;
	const px = modulePx * (modules + 8);
	canvas.width = px;
	canvas.height = px;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not draw the code.");
	ctx.imageSmoothingEnabled = false;
	ctx.fillStyle = background;
	ctx.fillRect(0, 0, px, px);
	ctx.fillStyle = foreground;
	for (let row = 0; row < modules; row += 1) for (let col = 0; col < modules; col += 1) if (symbol.modules.get(row, col)) ctx.fillRect((col + QUIET_MODULES) * modulePx, (row + QUIET_MODULES) * modulePx, modulePx, modulePx);
	return {
		px,
		version: symbol.version,
		modules
	};
}
function fileName(text) {
	const trimmed = text.trim();
	try {
		const host = new URL(trimmed).hostname.replace(/^www\./, "").replace(/[^a-z0-9.-]+/gi, "");
		if (host) return `qr-${host}.png`;
	} catch {}
	const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32);
	return slug ? `qr-${slug}.png` : "qr-code.png";
}
function ColorField({ id, label, value, onChange }) {
	const [draft, setDraft] = (0, import_react.useState)(value.toUpperCase());
	(0, import_react.useEffect)(() => {
		setDraft(value.toUpperCase());
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: id,
			className: "text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id,
				type: "color",
				value,
				onChange: (event) => onChange(event.target.value.toLowerCase()),
				suppressHydrationWarning: true,
				className: "size-11 shrink-0 rounded-lg border border-line bg-field"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "text",
				value: draft,
				spellCheck: false,
				autoCapitalize: "off",
				autoCorrect: "off",
				maxLength: 7,
				"aria-label": `${label} hex`,
				suppressHydrationWarning: true,
				onChange: (event) => {
					const next = event.target.value.toUpperCase();
					setDraft(next);
					if (HEX.test(next)) onChange(next.toLowerCase());
				},
				onBlur: () => setDraft(value.toUpperCase()),
				className: "h-11 min-w-0 flex-1 rounded-lg border border-line bg-field px-3 tracking-wide text-ink"
			})]
		})]
	});
}
function QrStudio() {
	const baseId = (0, import_react.useId)();
	const contentId = `${baseId}-content`;
	const fgId = `${baseId}-fg`;
	const bgId = `${baseId}-bg`;
	const sizeId = `${baseId}-size`;
	const hintId = `${baseId}-hint`;
	const [content, setContent] = (0, import_react.useState)("");
	const [fg, setFg] = (0, import_react.useState)(DEFAULT_FG);
	const [bg, setBg] = (0, import_react.useState)(DEFAULT_BG);
	const [ecc, setEcc] = (0, import_react.useState)("M");
	const [moduleSize, setModuleSize] = (0, import_react.useState)(8);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [imageUrl, setImageUrl] = (0, import_react.useState)(null);
	const [meta, setMeta] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const saved = JSON.parse(raw);
				if (typeof saved.content === "string") setContent(saved.content);
				if (isHex(saved.fg)) setFg(saved.fg.toLowerCase());
				if (isHex(saved.bg)) setBg(saved.bg.toLowerCase());
				if (isEcc(saved.ecc)) setEcc(saved.ecc);
				if (typeof saved.moduleSize === "number" && saved.moduleSize >= MODULE_MIN && saved.moduleSize <= MODULE_MAX) setModuleSize(saved.moduleSize);
			}
		} catch {}
		setHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			content,
			fg,
			bg,
			ecc,
			moduleSize
		}));
	}, [
		hydrated,
		content,
		fg,
		bg,
		ecc,
		moduleSize
	]);
	(0, import_react.useEffect)(() => {
		if (content.trim() === "") {
			setImageUrl(null);
			setMeta(null);
			setError(null);
			return;
		}
		try {
			const canvas = document.createElement("canvas");
			const next = paint(canvas, content, ecc, fg, bg, moduleSize);
			setImageUrl(canvas.toDataURL("image/png"));
			setMeta(next);
			setError(null);
		} catch (err) {
			setImageUrl(null);
			setMeta(null);
			setError(friendlyError(err));
		}
	}, [
		content,
		ecc,
		fg,
		bg,
		moduleSize
	]);
	const warning = imageUrl ? scanNote(fg, bg) : null;
	const statusText = error ? error : warning ? warning : meta ? `Version ${meta.version}. ${meta.px} by ${meta.px} pixels. Ready to download.` : "The preview updates as you type.";
	function download() {
		if (!imageUrl) return;
		const link = document.createElement("a");
		link.href = imageUrl;
		link.download = fileName(content);
		document.body.appendChild(link);
		link.click();
		link.remove();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 pb-24 sm:px-6 sm:py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-start gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-11 shrink-0 items-center justify-center rounded-lg bg-ink text-surface",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-6" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl leading-tight font-medium text-balance sm:text-5xl",
					children: "Quiet Zone"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-pretty text-muted",
					children: "Type a URL or any text. The code redraws immediately — then save a PNG."
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex min-w-0 flex-col gap-2 lg:col-start-1 lg:row-start-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: contentId,
								className: "text-sm font-medium",
								children: "URL or text"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setContent(""),
								disabled: content.length === 0,
								className: "text-sm font-medium text-muted disabled:opacity-40",
								children: "Clear"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							id: contentId,
							value: content,
							onChange: (event) => setContent(event.target.value),
							rows: 4,
							spellCheck: false,
							autoComplete: "off",
							placeholder: "https://example.com",
							"aria-describedby": hintId,
							suppressHydrationWarning: true,
							className: "min-h-28 w-full resize-y rounded-xl border border-line bg-field px-3 py-3 text-ink placeholder:text-muted"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							id: hintId,
							className: "text-sm text-muted tabular-nums",
							children: content.length === 0 ? "Links and plain text both work." : `${content.length} characters`
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "min-w-0 rounded-card border border-line bg-surface p-4 shadow-panel sm:p-5 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:row-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium",
							children: "Preview"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative mt-3 aspect-square w-full overflow-hidden rounded-xl border border-line bg-field",
							children: imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: imageUrl,
								alt: content.trim().length > 120 ? `QR code for ${content.trim().slice(0, 120)}…` : `QR code for ${content.trim()}`,
								className: "qr-preview h-full w-full"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-muted",
								children: [error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
									className: "size-8 text-warn",
									"aria-hidden": "true"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, {
									className: "size-8",
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: error ? "This text can’t be encoded yet." : "Your code appears here as soon as you type." })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							role: "status",
							"aria-live": "polite",
							className: `mt-3 flex gap-2 text-sm ${error || warning ? "text-warn" : "text-muted"}`,
							children: [(error || warning) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
								className: "mt-0.5 size-4 shrink-0",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: statusText })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: download,
							disabled: !imageUrl,
							className: "mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent font-semibold text-field motion-safe:transition-colors hover:bg-accent-hover disabled:opacity-40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
								className: "size-4",
								"aria-hidden": "true"
							}), "Download PNG"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex min-w-0 flex-col gap-8 lg:col-start-1 lg:row-start-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
									className: "text-sm font-medium",
									children: "Colors"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 grid gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
										id: fgId,
										label: "Foreground",
										value: fg,
										onChange: setFg
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
										id: bgId,
										label: "Background",
										value: bg,
										onChange: setBg
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 flex flex-wrap gap-2",
									children: SWATCHES.map((swatch) => {
										const selected = fg === swatch.fg && bg === swatch.bg;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											"aria-pressed": selected,
											onClick: () => {
												setFg(swatch.fg);
												setBg(swatch.bg);
											},
											className: `flex h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium ${selected ? "border-accent bg-accent-soft" : "border-line bg-field"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"aria-hidden": "true",
												className: "size-5 rounded border border-line",
												style: { background: `linear-gradient(135deg, ${swatch.fg} 50%, ${swatch.bg} 50%)` }
											}), swatch.name]
										}, swatch.name);
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: sizeId,
										className: "text-sm font-medium",
										children: "Module size"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
										htmlFor: sizeId,
										className: "text-sm text-muted tabular-nums",
										children: [
											moduleSize,
											" px",
											meta ? ` · ${meta.px}×${meta.px}` : ""
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: sizeId,
									type: "range",
									min: MODULE_MIN,
									max: MODULE_MAX,
									step: 1,
									value: moduleSize,
									onChange: (event) => setModuleSize(Number(event.target.value)),
									"aria-valuemin": MODULE_MIN,
									"aria-valuemax": MODULE_MAX,
									"aria-valuenow": moduleSize,
									"aria-valuetext": `${moduleSize} pixels per module`,
									suppressHydrationWarning: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Larger modules stay sharp when the PNG is printed or scanned."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "text-sm font-medium",
								children: "Error correction"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "Higher levels survive scratches and logos, and fit less text."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4",
								children: LEVELS.map((level) => {
									const selected = ecc === level.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: `flex min-h-11 cursor-pointer flex-col justify-center rounded-lg border px-3 py-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${selected ? "border-accent bg-accent-soft" : "border-line bg-field"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "radio",
												name: "error-correction",
												value: level.id,
												checked: selected,
												onChange: () => setEcc(level.id),
												suppressHydrationWarning: true,
												className: "sr-only"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-medium",
												children: level.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-sm text-muted",
												children: [level.recovery, " recovery"]
											})
										]
									}, level.id);
								})
							})
						] })
					]
				})
			]
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrStudio, {});
}
//#endregion
export { Home as component };
