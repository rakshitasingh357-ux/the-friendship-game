import type { ReactNode } from "react";
import "./instruction-guide.css";

export type InstructionPage = {
  title: string;
  content: ReactNode;
};

type Props = {
  pages: InstructionPage[];
  pageIndex: number;
  onPageChange: (page: number) => void;
  onStart: () => void;
  onMap: () => void;
  startLabel: string;
  eyebrow: string;
  theme?: string;
  overlay?: boolean;
  className?: string;
  panelClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  pageClassName?: string;
  footerClassName?: string;
  navigationClassName?: string;
  buttonClassName?: string;
};

export default function InstructionGuide({
  pages,
  pageIndex,
  onPageChange,
  onStart,
  onMap,
  startLabel,
  eyebrow,
  theme = "friendship",
  overlay = false,
  className = "",
  panelClassName = "",
  headerClassName = "",
  contentClassName = "",
  pageClassName = "",
  footerClassName = "",
  navigationClassName = "",
  buttonClassName = "",
}: Props) {
  const page = pages[pageIndex];
  if (!page) return null;

  return (
    <div className={`instruction-guide ${theme} ${overlay ? "instruction-guide-overlay" : ""} ${className}`}>
      <section className={`instruction-guide-panel ${panelClassName}`} role="dialog" aria-modal={overlay || undefined} aria-labelledby="instruction-guide-title">
        <header className={`instruction-guide-header ${headerClassName}`}>
          <div>
            <span className="instruction-guide-eyebrow">{eyebrow}</span>
            <h2 id="instruction-guide-title">{page.title}</h2>
          </div>
          <button type="button" className="instruction-guide-map" onClick={onMap}>WORLD MAP</button>
        </header>
        <div className={`instruction-guide-content ${contentClassName}`} key={pageIndex} aria-live="polite">
          <div className={`instruction-guide-page ${pageClassName}`}>{page.content}</div>
        </div>
        <footer className={`instruction-guide-footer ${footerClassName}`}>
          <div className="instruction-guide-progress">
            <div className="instruction-guide-page-status">
              <span>PAGE {pageIndex + 1} OF {pages.length}</span>
              <span>{pages.length - pageIndex - 1} {pages.length - pageIndex - 1 === 1 ? "PAGE" : "PAGES"} REMAINING</span>
            </div>
            <div className="instruction-guide-progress-track" role="progressbar" aria-label="Instruction page progress" aria-valuemin={1} aria-valuemax={pages.length} aria-valuenow={pageIndex + 1}>
              <span style={{ width: `${((pageIndex + 1) / pages.length) * 100}%` }} />
            </div>
          </div>
          <nav className={`instruction-guide-navigation ${navigationClassName}`} aria-label="Instruction page navigation">
            <button type="button" className={`instruction-guide-button secondary ${buttonClassName}`} onClick={() => onPageChange(Math.max(0, pageIndex - 1))} disabled={pageIndex === 0}>PREVIOUS</button>
            {pageIndex < pages.length - 1
              ? <button type="button" className={`instruction-guide-button primary ${buttonClassName}`} onClick={() => onPageChange(Math.min(pages.length - 1, pageIndex + 1))}>NEXT</button>
              : <button type="button" className={`instruction-guide-button primary ${buttonClassName}`} onClick={onStart}>{startLabel}</button>}
          </nav>
        </footer>
      </section>
    </div>
  );
}
