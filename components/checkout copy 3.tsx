"use client"; // Indique que ce composant est côté client

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/components/ui/use-toast";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutComponent() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "card",
  });

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // Assuming 10% tax
  const total = subtotal + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction pour lancer le paiement Mobile Money avec PayTech
  const initiateMobileMoneyPayment = async () => {
    try {
      const order = {
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
          extras: item.extras || [],
        })),
        total: Number(total.toFixed(2)),
        status: "pending",
        createdAt: new Date(),
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        deliveryAddress: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
        paymentMethod: "mobileMoney",
      };

      // Enregistrer la commande dans Firestore
      const docRef = await addDoc(collection(db, "orders"), order);

      // Lancer le paiement avec PayTech
      const paytech = new (window as any).PayTech({
        apiKey: process.env.NEXT_PUBLIC_PAYTECH_API_KEY, // Clé API publique
        secretKey: process.env.NEXT_PUBLIC_PAYTECH_SECRET_KEY, // Clé secrète publique
      });

      paytech.withOption({
        tokenUrl: `https://paytech.sn/payment/checkout/${docRef.id}`, // URL de paiement générée
        prensentationMode: (window as any).PayTech.OPEN_IN_POPUP, // Ouvrir dans un popup
      }).send();

      // Rediriger vers la page de confirmation après le paiement
      router.push(`/order-confirmation?orderId=${docRef.id}`);
    } catch (error) {
      console.error("Erreur lors du lancement du paiement Mobile Money :", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du lancement du paiement. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Valider les données du formulaire
      if (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.address ||
        !formData.city ||
        !formData.postalCode
      ) {
        throw new Error("Veuillez remplir tous les champs obligatoires.");
      }

      // Si le mode de paiement est Mobile Money, lancer le paiement
      if (formData.paymentMethod === "mobileMoney") {
        await initiateMobileMoneyPayment();
        return;
      }

      // Pour les autres modes de paiement, enregistrer la commande
      const order = {
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
          extras: item.extras || [],
        })),
        total: Number(total.toFixed(2)),
        status: "pending",
        createdAt: new Date(),
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        deliveryAddress: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
        paymentMethod: formData.paymentMethod,
      };

      // Enregistrer la commande dans Firestore
      const docRef = await addDoc(collection(db, "orders"), order);

      // Vider le panier
      clearCart();

      // Afficher un message de succès
      toast({
        title: "Commande confirmée",
        description: "Votre commande a été passée avec succès.",
      });

      // Rediriger vers la page de confirmation
      router.push(`/order-confirmation?orderId=${docRef.id}`);
    } catch (error) {
      console.error("Erreur lors de la soumission de la commande :", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la soumission de votre commande. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Charger le SDK PayTech
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://paytech.sn/cdn/paytech.min.js";
    script.async = true;
    document.body.appendChild(script);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://paytech.sn/cdn/paytech.min.css";
    document.head.appendChild(link);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  return (
    <>
      <main className="container overflow-y-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Paiement</h1>

        <div className="grid gap-6 h-96 md:grid-cols-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4 px-4">
              <div>
                <Label>Mode de paiement</Label>
                <RadioGroup
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, paymentMethod: value }))
                  }
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex p-5 justify-between items-center space-x-2 rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-black border-2 shadow-xl transition-all duration-300"
                  >
                    <CreditCard />
                    <Label htmlFor="card">Carte bancaire</Label>
                    <RadioGroupItem value="card" id="card" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex p-5 justify-between items-center space-x-2 rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-black border-2 shadow-xl transition-all duration-300"
                  >
                    <CreditCard />
                    <Label htmlFor="cash">Espèces</Label>
                    <RadioGroupItem value="cash" id="cash" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex p-5 justify-between items-center space-x-2 rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-black border-2 shadow-xl transition-all duration-300"
                  >
                    <CreditCard />
                    <Label htmlFor="mobileMoney">Mobile Money</Label>
                    <RadioGroupItem value="mobileMoney" id="mobileMoney" />
                  </motion.div>
                </RadioGroup>
              </div>

              {/* ... (le reste du formulaire) ... */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button type="submit" className="w-full">
                  Confirmer la commande
                </Button>
              </motion.div>
            </form>
          </motion.div>

          {/* ... (le reste du composant) ... */}
        </div>
      </main>
    </>
  );
}