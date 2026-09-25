/**
 * Scroll-spy for in-page link lists (docs "On this page", the components gallery index).
 *
 * `defineScrollSpy(tag, linkSelector)` registers a custom element that marks the link for the
 * section currently in view with `aria-current="true"`, and scrolls to sections on click
 * (instantly under `prefers-reduced-motion`). Links must be `href="#<section-id>"`.
 */
export function defineScrollSpy(tagName: string, linkSelector: string): void {
  if (typeof customElements === 'undefined' || customElements.get(tagName)) return;

  class ScrollSpy extends HTMLElement {
    private observer: IntersectionObserver | null = null;

    connectedCallback(): void {
      const links = Array.from(this.querySelectorAll<HTMLAnchorElement>(linkSelector));
      if (links.length === 0) return;

      const linksById = new Map<string, HTMLAnchorElement>();
      links.forEach((link) => {
        const id = link.getAttribute('href')?.slice(1);
        if (id) linksById.set(id, link);
      });

      const setActive = (id: string | null) => {
        links.forEach((link) => link.removeAttribute('aria-current'));
        if (id) linksById.get(id)?.setAttribute('aria-current', 'true');
      };

      this.observer?.disconnect();
      this.observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible[0]) setActive(visible[0].target.id);
        },
        { rootMargin: '-96px 0px -70% 0px', threshold: [0, 1] }
      );

      linksById.forEach((_link, id) => {
        const target = document.getElementById(id);
        if (target) this.observer?.observe(target);
      });

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      links.forEach((link) => {
        link.addEventListener('click', (event) => {
          const id = link.getAttribute('href')?.slice(1);
          const target = id ? document.getElementById(id) : null;
          if (!target) return;
          event.preventDefault();
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
          history.replaceState(null, '', `#${id}`);
        });
      });
    }

    disconnectedCallback(): void {
      this.observer?.disconnect();
      this.observer = null;
    }
  }

  customElements.define(tagName, ScrollSpy);
}
