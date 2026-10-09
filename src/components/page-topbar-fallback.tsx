// Static shell for dashboard pages whose body streams in at request time.
export function PageTopbarFallback({ title }: { title: string }) {
  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
      </div>
    </div>
  );
}
