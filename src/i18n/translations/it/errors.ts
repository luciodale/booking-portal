import type { errors as en } from "../en/errors";

export const errors: Record<keyof typeof en, string> = {
  "error.dbNotAvailable": "Database non disponibile",
  "error.stripeNotConfigured": "Stripe non configurato",
  "error.invalidRequest": "Richiesta non valida",
  "error.propertyNotFound":
    "Proprietà non trovata o non collegata al PMS",
  "error.noPmsIntegration": "Nessuna integrazione PMS trovata",
  "error.minStay":
    "Il soggiorno minimo è di {nights} notti per le date selezionate",
  "error.propertyNotAvailable":
    "La proprietà non è più disponibile per queste date",
  "error.unableToComputePrice":
    "Impossibile calcolare il prezzo per questo soggiorno",
  "error.priceChanged":
    "Il prezzo è cambiato. Aggiorna la pagina e riprova.",
  "error.cityTaxChanged":
    "La tassa di soggiorno è cambiata. Aggiorna la pagina e riprova.",
  "error.mockWebhookFailed": "Webhook di test fallito",
  "error.signInRequired": "Accesso richiesto",
  "error.checkoutFailed": "Checkout fallito",
  "error.experienceNotFound": "Esperienza non trovata",
  "error.experienceNotBookable":
    "Questa esperienza non supporta la prenotazione online",
  "error.maxParticipants": "Massimo {count} partecipanti consentiti",
  "error.failedToFetchBookings":
    "Impossibile caricare le prenotazioni",
  "error.recordAlreadyExists": "Questo record esiste già",
  "error.requiredFieldMissing": "Un campo obbligatorio è mancante",
  "error.nightPriceMismatch":
    "Previsti {expected} prezzi notturni, ricevuti {received}",
  "error.unauthorized": "Non autorizzato",
  "error.forbidden": "Accesso negato",
  "error.missingPropertyId": "ID proprietà mancante",
  "error.missingRequiredFields": "Campi obbligatori mancanti",
  "error.missingRequiredParams": "Parametri obbligatori mancanti",
  "error.smoobuNotConfigured": "ID utente Smoobu non configurato",
  "error.failedToCheckAvailability": "Impossibile verificare la disponibilità",
  "error.failedToFetchProperty": "Impossibile caricare la proprietà",
  "error.failedToFetchRates": "Impossibile caricare le tariffe",
  "error.missingBookingId": "ID prenotazione mancante",
  "error.bookingNotFound": "Prenotazione non trovata",
  "error.forbiddenNotYourProperty": "Accesso negato: non è la tua proprietà",
  "error.cannotCancelBooking": "Impossibile cancellare la prenotazione con stato \"{status}\"",
  "error.failedToCancelBooking": "Impossibile cancellare la prenotazione",
  "error.failedToListBookings": "Impossibile elencare le prenotazioni",
};
