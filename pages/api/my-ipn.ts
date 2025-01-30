import crypto from 'crypto';

// Fonction pour hasher une chaîne en SHA256
function SHA256Encrypt(password) {
  const sha256 = crypto.createHash('sha256');
  sha256.update(password);
  return sha256.digest('hex');
}

export default async function handler(req, res) {
  // Vérifier que la méthode est POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Extraire les paramètres de la requête
    const {
      type_event,
      client_phone,
      payment_method,
      item_name,
      item_price,
      ref_command,
      command_name,
      currency,
      env,
      custom_field,
      token,
      api_key_sha256,
      api_secret_sha256,
    } = req.body;

    // Récupérer les clés API depuis les variables d'environnement
    const my_api_key = process.env.API_KEY;
    const my_api_secret = process.env.API_SECRET;

    if (!my_api_key || !my_api_secret) {
      return res.status(500).json({ message: 'API keys are not configured.' });
    }

    // Vérification des clés API
    if (
      SHA256Encrypt(my_api_secret) === api_secret_sha256 &&
      SHA256Encrypt(my_api_key) === api_key_sha256
    ) {
      // La requête provient de PayTech, vous pouvez procéder au traitement
      console.log('Notification valide reçue de PayTech :', {
        type_event,
        client_phone,
        payment_method,
        item_name,
        item_price,
        ref_command,
        command_name,
        currency,
        env,
        custom_field: JSON.parse(custom_field),
        token,
      });

      // Traitez ici, par exemple, mettez à jour la base de données ou effectuez une action
      return res.status(200).json({ message: 'Paiement traité avec succès.' });
    } else {
      // Clés API invalides
      console.error('Clé API invalide ou mauvaise configuration');
      return res.status(403).json({ message: 'Clé API invalide ou environnement incorrect.' });
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la notification IPN :', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}
