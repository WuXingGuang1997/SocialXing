import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h2 className="text-2xl font-bold">Pagina Non Trovata</h2>
      <p>Impossibile trovare la risorsa richiesta.</p>
      <Link href="/" className="mt-4 text-blue-500 hover:underline">
        Torna alla Homepage
      </Link>
    </div>
  );
} 