import { links } from '../config/links';
import { brand, footer } from '../data/copy';

function resolveHref(href: string): string {
  if (href.startsWith('#')) return href;
  if (href in links) return links[href as keyof typeof links];
  return href;
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <a href="#top" className="nav__logo">
            {brand.name}
          </a>
          <p>{footer.blurb}</p>
        </div>

        <div className="footer__cols">
          {footer.columns.map((col) => (
            <div key={col.title} className="footer__col">
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={resolveHref(l.href)}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="container footer__bottom">
        <p>{footer.copyright}</p>
        <p className="footer__note">
          CTA URLs configured in <code>src/config/links.ts</code>
        </p>
      </div>
    </footer>
  );
}
