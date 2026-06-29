"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";

const translatedAttributes = ["placeholder", "title", "aria-label"] as const;

export function AppLocalizationBridge({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textSources = useRef(new WeakMap<Text, { source: string; lastApplied: string }>());
  const attributeSources = useRef(new WeakMap<Element, Map<string, { source: string; lastApplied: string }>>());
  const { locale, translateLiteral } = useI18n();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    function translateText(node: Text) {
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, code, pre, [data-no-translate]")) return;
      const current = node.nodeValue ?? "";
      const existing = textSources.current.get(node);
      const source = existing && current === existing.lastApplied ? existing.source : current;
      const trimmed = source.trim();
      if (!trimmed) return;
      const translated = translateLiteral(trimmed);
      const leading = source.match(/^\s*/)?.[0] ?? "";
      const trailing = source.match(/\s*$/)?.[0] ?? "";
      const next = `${leading}${translated}${trailing}`;
      textSources.current.set(node, { source, lastApplied: next });
      if (current !== next) node.nodeValue = next;
    }

    function translateElement(element: Element) {
      if (element.closest("[data-no-translate]")) return;
      let sources = attributeSources.current.get(element);
      if (!sources) {
        sources = new Map();
        attributeSources.current.set(element, sources);
      }
      translatedAttributes.forEach((attribute) => {
        const current = element.getAttribute(attribute);
        if (!current) return;
        const existing = sources!.get(attribute);
        const source = existing && current === existing.lastApplied ? existing.source : current;
        const translated = translateLiteral(source);
        sources!.set(attribute, { source, lastApplied: translated });
        if (current !== translated) element.setAttribute(attribute, translated);
      });
    }

    function translateTree(target: Node) {
      if (target.nodeType === Node.TEXT_NODE) {
        translateText(target as Text);
        return;
      }
      if (target.nodeType !== Node.ELEMENT_NODE) return;
      translateElement(target as Element);
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        if (node.nodeType === Node.TEXT_NODE) translateText(node as Text);
        else translateElement(node as Element);
        node = walker.nextNode();
      }
    }

    translateTree(root);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") translateText(mutation.target as Text);
        mutation.addedNodes.forEach(translateTree);
        if (mutation.type === "attributes") translateElement(mutation.target as Element);
      });
    });
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...translatedAttributes],
    });
    return () => observer.disconnect();
  }, [locale, translateLiteral]);

  return <div ref={rootRef} className="contents">{children}</div>;
}
