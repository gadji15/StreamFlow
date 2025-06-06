'use client';

export default function FavorisPage() {
  return (
    <div className="min-h-[50vh] flex flex-col justify-center items-center p-6">
      <h1 className="text-lg sm:text-3xl font-bold mb-2 text-primary text-center">Mes favoris</h1>
      <p className="text-gray-400 text-sm sm:text-base text-center">
        Ici, vous retrouverez tous vos films et séries sauvegardés. (À personnaliser selon vos favoris prochainement.)
      </p>
    </div>
  );
}