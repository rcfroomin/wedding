
export type AttireProduct = {
  id: string;
  category: "women" | "men" | "accessories";
  name: string;
  brand: string;
  description: string;
  price: string;
  image: string;
  imageAlt: string;
  productUrl: string;
};

export const attireProducts: AttireProduct[] = [
  // WOMEN'S LOOKBOOK
  {
    id: "dress-01",
    category: "women",
    name: "Mint Tea-Length Fluted Dress",
    brand: "Birdy Grey",
    description: "A romantic mint green dress with a modern silhouette.",
    price: "$129",
    image: "/images/BirdyGreyVerandaDress.png",
    imageAlt: "Floral midi dress in a garden-party color palette",
    productUrl: "https://www.birdygrey.com/products/veranda-dress-mint-green",
  },

  {
    id: "dress-02",
    category: "women",
    name: "Floral Statement Occasion Dress",
    brand: "Birdy Grey",
    description: "A distinctive silhouette for a dressed-up garden setting.",
    price: "$149",
    image: "/images/BirdyGreyRivieraDress.png",
    imageAlt: "Statement occasion dress",
    productUrl: "https://www.birdygrey.com/products/riviera-dress-yellow-multi",
  },

  {
    id: "dress-03",
    category: "women",
    name: "Pink Patterned Floral Dress",
    brand: "Lulus",
    description: "A mesmerizing floral chiffon dress with an attached sash scarf.",
    price: "$89",
    image: "/images/LulusAdelineDress.png",
    imageAlt: "Patterned one-shoulder maxi dress",
    productUrl: "https://www.lulus.com/products/adeline-light-pink-floral-one-shoulder-scarf-maxi-dress/2792316.html?pla=1&utm_source=google&utm_medium=cpc&utm_campaign=%5BADL%5D%20%5BPLA%5D%20%5BGoogle%5D%20%5BUS%5D%20Dresses%20-%20tROAS%20-%20West&utm_term=DJ1672PP%3A%20LIGHT%20PINK%2FBLUE%2FGREEN1&utm_content=181345049261_771039539904&s_kwcid=AL%217824%213%21771039539904%21%21%21g%212018066399993%21&gad_source=4&gad_campaignid=22935751913&gbraid=0AAAAAD-pt91gjRI8eJb7XUbq9G85Cv5nn&gclid=Cj0KCQjw3YvXBhCDARIsAKB-ox8Y-b7nlqo7Rz1uu345n8xloWubuPzVSj7qbKmxm5XMvKS7T3BzL8QaAsmZEALw_wcB",
  },

  {
    id: "dress-04",
    category: "women",
    name: "Pastel Green Ankle-Length Dress",
    brand: "Birdy Grey",
    description: "A soft pastel green shade with an elegant hemline.",
    price: "$139",
    image: "/images/BirdyGreyGalaDress.png",
    imageAlt: "Pastel ankle-length dress",
    productUrl: "https://www.birdygrey.com/products/gala-dress-light-green?",
  },
  {
    id: "dress-05",
    category: "women",
    name: "Blue Pleated Asymmetrical Dress",
    brand: "Lulus",
    description: "An intricate blue dress with layered ruffled detailing.",
    price: "$99",
    image: "/images/LulusMagdaleneDress.png",
    imageAlt: "Pleated asymmetrical wedding guest dress",
    productUrl: "https://www.lulus.com/products/magdalene-powder-blue-pleated-asymmetrical-maxi-dress/2802471.html?pla=1&utm_source=google&utm_medium=cpc&utm_campaign=%5BADL%5D%20%5BPLA%5D%20%5BGoogle%5D%20%5BUS%5D%20Dresses%20-%20tROAS%20-%20West&utm_term=3795%3A%20POWDER%20BLUE2&utm_content=181345049261_771039539904&s_kwcid=AL%217824%213%21771039539904%21%21%21g%212018066399993%21&gad_source=4&gad_campaignid=22935751913&gbraid=0AAAAAD-pt91gjRI8eJb7XUbq9G85Cv5nn&gclid=Cj0KCQjw3YvXBhCDARIsAKB-ox_AJAY0QItoMg-7MxARogQ3FiBc367oHWl0Aylr9uOaVPobQcGtM6waAlGWEALw_wcB",
  },

  {
    id: "dress-06",
    category: "women",
    name: "Pink Ruffled Occasion Dress",
    brand: "Birdy Grey",
    description: "A playful pink dress with polished special-occasion styling.",
    price: "$119",
    image: "/images/BirdyGreyLegacyDress.png",
    imageAlt: "Printed wedding guest dress",
    productUrl: "https://www.birdygrey.com/products/legacy-dress-bright-pink",
  },

  // MEN'S LOOKBOOK
  {
    id: "suit-01",
    category: "men",
    name: "Colorful Tailored Suit",
    brand: "Abercrombie",
    description: "A fresh take on occasionwear in a fun suit color.",
    price: "$208",
    image: "/images/AbercrombieCollinsSuit.png",
    imageAlt: "Colorful tailored suit",
    productUrl: "https://www.abercrombie.com/shop/us/p/the-a-and-f-collins-tailored-linen-blend-suit-pant-59111352?seq=05&source=googleshopping&cmp=PLA:EVG:20:A:D:US:X:GGL:X:SHOP:X:X:X:X:x:ANF_Google_Shopping_DC_LIA_US_Bottoms_X_All+products_PRODUCT_GROUP&gclsrc=aw.ds&gad_source=1&gad_campaignid=17296619681&gbraid=0AAAAADeAqWM5BXOQxVmjv5_gjjJlkH_5C&gclid=Cj0KCQjw3YvXBhCDARIsAKB-ox90cK70Dmbag_5kMOjJf7qdNj_KPqv4jenRD6ZgXWOUkJSm91P76psaAnQlEALw_wcB",
  },
  {
    id: "suit-02",
    category: "men",
    name: "Lightweight Suit",
    brand: "Bonobos",
    description: "A polished look in a lighter, garden-ready fabric.",
    price: "$398",
    image: "/images/BonobosCooperSuit.png",
    imageAlt: "Lightweight suit for a garden wedding",
    productUrl: "https://bonobos.com/products/cooper-italian-linen-tencel-suit?color=Taupe&blazer-size=38R&blazer-fit=One+Fit&variant=48638729355505",
  },
  {
    id: "suit-03",
    category: "men",
    name: "Pastel Yellow Suit",
    brand: "Joseph & Feiss",
    description: "A fun pastel yellow suit with a contemporary profile.",
    price: "$398",
    image: "/images/MensWearhouseSuit.png",
    imageAlt: "Pastel yellow contemporary suit",
    productUrl: "https://www.menswearhouse.com/p/modern-fit-suit-tmw-3bru?clearance=true&color=yellow&size=42&length=short&CAWELAID=120259610002294891&CAGPSPN=pla&CAAGID=&CATCI=&adtype=pla&product_channel=online&product_click_id=TMW3BT442108&store_code_id=&gad_source=4&gad_campaignid=20493046214&gbraid=0AAAAADipZBOdJiBUDsyM96oE2kp9u9HVL&gclid=Cj0KCQjw3YvXBhCDARIsAKB-ox_rgiGh0FUi_0MCR9nqN5ri6YbaAnT26RLyNrx00lERlfH73dTOrSYaAvJ-EALw_wcB",
  },
];
