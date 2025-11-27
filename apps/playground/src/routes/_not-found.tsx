export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-white text-gray-800">
      <div className="text-center space-y-4">
        <p className="text-sm font-semibold tracking-widest text-gray-400">
          404
        </p>
        <h1 className="text-3xl font-bold">Pagina nao encontrada</h1>
        <p className="text-base text-gray-600">
          Verifique o endereco digitado ou volte para a pagina inicial.
        </p>
        <a
          href="/"
          className="inline-block rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Ir para o início
        </a>
      </div>
    </div>
  );
}
