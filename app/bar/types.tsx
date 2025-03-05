export interface MenuItem {
    id: number
    name: string
    description: string
    price: number
    image: string
    ingredients: string[]
    category: string
  }
  
  export interface MenuSection {
    title: string
    items: MenuItem[]
  }
  
  