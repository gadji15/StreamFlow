export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mentions légales</h1>
        
        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Informations légales</h2>
          <p>
            Le site StreamFlow est édité par :
          </p>
          <p className="mt-4">
            <strong>StreamFlow SAS</strong><br />
            Société par Actions Simplifiée au capital de 100 000 €<br />
            Siège social : 123 Avenue du Streaming, 75000 Paris, France<br />
            SIRET : 123 456 789 00012<br />
            RCS Paris B 123 456 789<br />
            N° TVA intracommunautaire : FR 12 123456789<br />
            Directeur de la publication : Jean Dupont, Président
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. Hébergement</h2>
          <p>
            Le site StreamFlow est hébergé par :
          </p>
          <p className="mt-4">
            <strong>CloudHost SAS</strong><br />
            Société par Actions Simplifiée au capital de 500 000 €<br />
            Siège social : 456 Rue des Serveurs, 69000 Lyon, France<br />
            Téléphone : +33 4 56 78 90 12
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des éléments constituant le site StreamFlow (textes, graphismes, logiciels, photographies, images, vidéos, sons, plans, logos, marques, créations et œuvres protégeables diverses, bases de données, etc.) ainsi que le site lui-même, relèvent des législations françaises et internationales sur le droit d&apos;auteur et la propriété intellectuelle.
          </p>
          <p className="mt-4">
            Ces éléments sont la propriété exclusive de StreamFlow SAS. La reproduction ou représentation, intégrale ou partielle, des pages, des données et de toute autre élément constitutif du site, par quelque procédé ou support que ce soit, est interdite et constitue sans autorisation de l&apos;éditeur une contrefaçon.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. Données personnelles</h2>
          <p>
            Les informations recueillies sur le site StreamFlow font l&apos;objet d&apos;un traitement informatique destiné à la gestion des abonnements, à la personnalisation des services et à des fins statistiques. Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de portabilité des données vous concernant.
          </p>
          <p className="mt-4">
            Pour exercer ces droits ou pour toute question sur le traitement de vos données, vous pouvez contacter notre Délégué à la Protection des Données (DPO) par email à dpo@streamflow.com ou par courrier à l&apos;adresse postale mentionnée ci-dessus.
          </p>
          <p className="mt-4">
            Pour plus d&apos;informations sur la façon dont nous traitons vos données, veuillez consulter notre <a href="/confidentialite" className="text-primary hover:underline">Politique de confidentialité</a>.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. Cookies</h2>
          <p>
            Le site StreamFlow utilise des cookies pour améliorer l&apos;expérience utilisateur, analyser le trafic et personnaliser le contenu. En naviguant sur notre site, vous acceptez notre utilisation des cookies conformément à notre politique en matière de cookies.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">6. Limitations de responsabilité</h2>
          <p>
            StreamFlow s&apos;efforce d&apos;assurer au mieux de ses possibilités l&apos;exactitude et la mise à jour des informations diffusées sur son site, dont elle se réserve le droit de corriger, à tout moment et sans préavis, le contenu. Toutefois, StreamFlow ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition sur son site.
          </p>
          <p className="mt-4">
            En conséquence, StreamFlow décline toute responsabilité :
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site</li>
            <li>Pour tous dommages résultant d&apos;une intrusion frauduleuse d&apos;un tiers ayant entraîné une modification des informations mises à disposition sur le site</li>
            <li>Et plus généralement pour tous dommages, directs ou indirects, qu&apos;elles qu&apos;en soient les causes, origines, natures ou conséquences, provoqués à raison de l&apos;accès de quiconque au site ou de l&apos;impossibilité d&apos;y accéder, de même que l&apos;utilisation du site et/ou du crédit accordé à une quelconque information provenant directement ou indirectement de ce dernier</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">7. Loi applicable et juridiction compétente</h2>
          <p>
            Les présentes mentions légales sont régies par la loi française. En cas de litige, les tribunaux français seront seuls compétents.
          </p>
          
          <p className="mt-10 text-gray-400">
            Dernière mise à jour : 22 juin 2023
          </p>
        </div>
      </div>
    </div>
  );
}