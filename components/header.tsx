// Dans votre composant Header existant, ajoutez le lien vers la page d'installation mobile
// Ceci est un exemple de l'endroit où ajouter ce lien - adaptez-le à votre navigation existante

// ... code existant ...

{/* Exemple d'emplacement dans un menu déroulant utilisateur */}
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <User className="h-5 w-5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem asChild>
      <Link href="/compte">Mon compte</Link>
    </DropdownMenuItem>
    <DropdownMenuItem asChild>
      <Link href="/ma-liste">Ma liste</Link>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    {/* Ajout du lien vers l'installation */}
    <DropdownMenuItem asChild>
      <Link href="/mobile" className="flex items-center">
        <Download className="h-4 w-4 mr-2" />
        <span>Installer l'application</span>
      </Link>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

// OU ajoutez-le comme lien de navigation standard

<div className="hidden md:flex items-center space-x-4">
  {/* Autres liens de navigation */}
  <Link href="/mobile" className="flex items-center text-sm font-medium px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700">
    <Download className="h-4 w-4 mr-1.5" />
    <span>Installer</span>
  </Link>
</div>

// ... reste du code existant ...