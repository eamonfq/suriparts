export default function LoadingSpinner({ message = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-10 h-10 border-4 border-navy-200 border-t-accent-500 rounded-full animate-spin" />
      <p className="text-navy-500 text-lg">{message}</p>
    </div>
  );
}
