export function Footer() {
  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3 lg:px-10">
        <div>
          <div className="display-section text-lg leading-tight">ande · examen</div>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Plataforma de preparación profesional para el examen ANDE Categoría A.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <div className="eyebrow text-foreground/80">Aviso</div>
          <p className="mt-2 leading-relaxed">
            Esta herramienta es para estudio. No representa al examen oficial de la
            ANDE. Las fuentes que aparecen con etiqueta ámbar requieren verificación
            contra el documento original.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <div className="eyebrow text-foreground/80">Fuentes principales</div>
          <ul className="mt-2 space-y-1 font-mono text-2xs uppercase tracking-wider">
            <li>F0018 · Pliego de Tarifas Nro. 21</li>
            <li>F0092 · Reglamento BT ANDE</li>
            <li>F0095 · Reglamento MT ANDE</li>
            <li>F0097 · NP 2 028 INTN</li>
            <li>F0004 · ANDE TAAs</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
            v0.1.0 · build local
          </span>
          <span className="text-2xs text-muted-foreground">
            Preparación para ingenieros eléctricos y electromecánicos.
          </span>
        </div>
      </div>
    </footer>
  );
}
