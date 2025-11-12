# Usa un'immagine ufficiale e leggera di Node.js
FROM node:18-slim

# Crea e imposta la directory di lavoro all'interno del container
WORKDIR /usr/src/app

# Copia i file package.json e package-lock.json
# Questo passaggio è separato per sfruttare la cache di Docker:
# se non cambi le dipendenze, non le re-installerà ogni volta.
COPY package*.json ./

# Installa le dipendenze del progetto (in questo caso, solo 'express')
RUN npm install

# Copia il resto del codice dell'applicazione (il tuo file index.js)
COPY . .

# Esponi la porta 8080, che è quella su cui Cloud Run si aspetta che il servizio sia in ascolto
EXPOSE 8080

# Il comando per avviare l'applicazione quando il container parte.
# Esegue lo script "start" definito nel tuo package.json ("node index.js")
CMD [ "npm", "start" ]
