"use client"; // Indique que ce composant est côté client

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

import { CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
    location: "",

  });

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [errors, setErrors] = useState({});

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // Assuming 10% tax
  const total = subtotal + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction pour obtenir la géolocalisation de l'utilisateur
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError("Impossible d'obtenir votre localisation. Veuillez l'indiquer manuellement.");
      }
    );
  };

  // Obtenir la localisation au chargement du composant
  useEffect(() => {
    getLocation();
  }, []);

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
        paymentMethod: formData.paymentMethod,
        location: location ? { latitude: location.latitude, longitude: location.longitude } : null, // Ajoutez la localisation
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
        placeholder: "Erreur",
        description: "Une erreur est survenue lors du lancement du paiement. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };


  // Fonction pour envoyer une notification FCM
  const sendNotification = async (orderId: string, customerName: string, total: number) => {
    try {
      // Récupérer le token d'inscription de l'admin
      const adminToken = "BN5VvqwZ_74MANvaL97WYOm8T3jbI5ufLRKBPg4A7LMGL4V2H4bjQbehuHOz_0LfQYkvWP3Eaia08kRCxqpTFPM"; // Remplace avec le vrai token de l'admin

      const notificationPayload = {
        to: adminToken,
        notification: {
          title: "Nouvelle Commande 🛒",
          body: `Une nouvelle commande de ${customerName} a été passée. Total: ${total} FCFA`,
          sound: "default",
        },
        data: {
          orderId: orderId,
          type: "new_order",
        },
      };

      // Envoyer la requête au serveur Firebase
      await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          Authorization: `key=${process.env.NEXT_PUBLIC_FIREBASE_SERVER_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationPayload),
      });

      console.log("Notification envoyée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification :", error);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Veuillez saisir un nom complet.";
    }

    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(formData.email)) {
      newErrors.email = "Veuillez saisir une adresse email valide.";
    }

    if (!/^[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = "Veuillez saisir un numéro de téléphone valide (9 chiffres).";
    }

    if (!/^[a-zA-Z0-9 -]{4,}$/.test(formData.address)) {
      newErrors.address = "Veuillez saisir une adresse valide (10 caractères minimum).";
    }

    if (!/^[a-zA-Z0-9 -]{5,}$/.test(formData.city)) {
      newErrors.city = "Veuillez saisir une ville valide (5 caractères minimum).";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
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
        location: location ? { latitude: location.latitude, longitude: location.longitude } : null, // Ajoutez la localisation

      };

      // Enregistrer la commande dans Firestore
      const docRef = await addDoc(collection(db, "orders"), order);
      // Envoyer la notification à l'admin
      await sendNotification(docRef.id, formData.name, total);

      // Vider le panier
      clearCart();

      // Afficher un message de succès
      toast({
        placeholder: "Commande confirmée",
        description: "Votre commande a été passée avec succès.",
      });

      // Rediriger vers la page de confirmation
      router.push(`/order-confirmation?orderId=${docRef.id}`);
    } catch (error) {
      console.error("Erreur lors de la soumission de la commande :", error);
      toast({
        placeholder: "Erreur",
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

  const sendOrderToWhatsApp = () => {
    const message = `Bonjour, je souhaite passer une commande sur https://b-resto.vercel.app/ :%0A
    - Nom : ${formData.name}%0A
    - Téléphone : ${formData.phone}%0A
    - Adresse : ${formData.address}, ${formData.city}, ${formData.postalCode}%0A
    - Command : ${formData.paymentMethod}%0A
    - Articles : ${cart.map(item => `${item.quantity} x ${item.name} (${item.price} FCFA)`).join("%0A")}%0A
    - Total : ${total.toFixed(2)} FCFA`;

    const whatsappNumber = "221766657278"; // Remplace avec le numéro WhatsApp du vendeur
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;

    window.open(whatsappURL, "_blank");
  };

  if (formData.paymentMethod === "whatsapp") {
    sendOrderToWhatsApp();
    return;
  }
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
                    className="flex p-5 justify-between items-center space-x-2 rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-orange-400 border-2 shadow-xl transition-all duration-300"
                  >


                    <CreditCard />
                    <Label htmlFor="card">Carte bancaire</Label>
                    <RadioGroupItem className="text-orange-500" value="card" id="card" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex p-5 justify-between items-center space-x-2 rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-orange-400 border-2 shadow-xl transition-all duration-300"
                  >
                    <CreditCard />
                    <Label htmlFor="cash">Espèces</Label>
                    <RadioGroupItem className="text-orange-500" value="cash" id="cash" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex p-5 justify-between items-center space-x-2 rounded-3xl bg-gradient-to-r mt-5 bg-white/50 backdrop-blur-xl border-orange-400 border-2 shadow-xl transition-all duration-300"
                  >
                    <CreditCard />
                    <Label htmlFor="mobileMoney">Mobile Money</Label>
                    <RadioGroupItem className="text-orange-500" value="mobileMoney" id="mobileMoney" />
                  </motion.div>
                </RadioGroup>
              </div>

              {/* Section de géolocalisation */}
              <div>
                <Label>Votre localisation</Label>
                {locationError ? (
                  <p className="text-sm text-red-500">{locationError}</p>
                ) : location ? (
                  <p className="text-sm text-gray-600">
                    Latitude: {location.latitude}, Longitude: {location.longitude}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">Chargement de la localisation...</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={getLocation}
                >
                  Rafraîchir la localisation
                </Button>
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
                    className=" rounded-3xl bg-gradient-to-r   border-orange-400 border-2 shadow-xl transition-all duration-300"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Veuillez saisir un nom complet"
                  />
                  {/* message error pattern*/}
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}

                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    className=" rounded-3xl bg-gradient-to-r   border-orange-400 border-2 shadow-xl transition-all duration-300"
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Veuillez saisir une adresse email valide"
                  />
                  {/* message error pattern*/}
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}

                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    className=" rounded-3xl bg-gradient-to-r   border-orange-400 border-2 shadow-xl transition-all duration-300"
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Veuillez saisir un numéro de téléphone valide (10 chiffres)"
                  />
                  {/* message error pattern*/}
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}

                </div>
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    className=" rounded-3xl bg-gradient-to-r   border-orange-400 border-2 shadow-xl transition-all duration-300"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Veuillez saisir une adresse valide (10 caractères minimum)"
                  />
                  {/* message error pattern*/}
                  {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}

                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    className=" rounded-3xl bg-gradient-to-r   border-orange-400 border-2 shadow-xl transition-all duration-300"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Veuillez saisir une ville valide (5 caractères minimum)"

                  />
                  {/* message error pattern*/}
                  {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}

                </div>
                <div>
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    className=" rounded-3xl bg-gradient-to-r   border-orange-400 border-2 shadow-xl transition-all duration-300"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button type="submit" className="w-full bg-orange-500 ">
                  Confirmer la commande
                </Button>
              </motion.div>
              {/* ou */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >

                  <span className="w-full lg:mx-[50%] text-center items-center justify-center  ">
                    Ou
                  </span>
              </motion.div>

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
                  className="flex p-3 cursor-pointer justify-between items-center space-x-2 rounded-xl bg-gradient-to-r mb-3 bg-teal-600 backdrop-blur-xl border-orange-400 border-2 shadow-xl transition-all duration-300"
                >
                  <Image
                    width={28}
                    height={28}
                    src="/whatsapp.png"
                    alt="Profile picture"
                    className="object-coverrounded"
                  />
                  <Label htmlFor="whatsapp" className="cursor-pointer">WhatsApp</Label>
                  <RadioGroupItem className="text-green-500" value="whatsapp" id="whatsapp" />
                </motion.div>
              </RadioGroup>
            </form>
          </motion.div>

          {/* ... (le reste du composant) ... */}
        </div>
      </main>
    </>
  );
}