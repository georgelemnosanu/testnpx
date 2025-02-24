import { MenuSection } from "./menu-section"

const menuData = {
  sections: [
    {
      title: "Aperitive",
      items: [
        {
          id: 1,
          name: "Supă de pui cu tăiței",
          description: "Supă tradițională cu carne de pui și tăiței de casă",
          price: 18,
          image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=60",
          ingredients: ["pui", "morcovi", "tăiței", "pătrunjel", "țelină"],
        },
        {
          id: 2,
          name: "Platou brânzeturi",
          description: "Selecție de brânzeturi fine cu nuci și miere",
          price: 35,
          image: "https://images.unsplash.com/photo-1631379578550-7038263db699?w=800&auto=format&fit=crop&q=60",
          ingredients: ["brânză brie", "cașcaval", "nuci", "miere", "struguri"],
        },
      ],
    },
    {
      title: "Fel Principal",
      items: [
        {
          id: 4,
          name: "Cocoș la ceaun",
          description: "Cocoș gătit la ceaun cu cartofi țărănești și murături",
          price: 45,
          image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&auto=format&fit=crop&q=60",
          ingredients: ["cocoș", "cartofi", "usturoi", "murături", "condimente"],
        },
        {
          id: 5,
          name: "Păstrăv la grătar",
          description: "Păstrăv proaspăt la grătar cu legume și lămâie",
          price: 40,
          image: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=800&auto=format&fit=crop&q=60",
          ingredients: ["păstrăv", "legume", "lămâie", "usturoi", "rozmarin"],
        },
        {
          id: 6,
          name: "Mușchi de vită",
          description: "Mușchi de vită cu sos de vin roșu și cartofi gratinați",
          price: 65,
          image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60",
          ingredients: ["mușchi de vită", "vin roșu", "cartofi", "smântână", "parmezan"],
        },
      ],
    },
    {
      title: "Desert",
      items: [
        {
          id: 7,
          name: "Papanași cu smântână",
          description: "Papanași tradiționali cu smântână și dulceață de afine",
          price: 25,
          image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&auto=format&fit=crop&q=60",
          ingredients: ["brânză de vaci", "smântână", "dulceață de afine", "zahăr", "făină"],
        },
        {
          id: 8,
          name: "Tort de ciocolată",
          description: "Tort de ciocolată belgiană cu fructe de pădure",
          price: 28,
          image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=60",
          ingredients: ["ciocolată belgiană", "ouă", "frișcă", "fructe de pădure", "zahăr"],
        },
      ],
    },
  ],
}

export default function MancareMenu() {
  return (
    <main className="min-h-[100dvh] bg-[#1a1a1a] pb-20">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] p-4 shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Meniu Bucătărie</h1>
      </header>
      <div className="p-4">
        {menuData.sections.map((section) => (
          <MenuSection key={section.title} section={section} />
        ))}
      </div>
    </main>
  )
}

