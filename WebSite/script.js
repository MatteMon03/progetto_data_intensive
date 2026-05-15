async function faiPrevisione() {
            // 1. Raccogliamo i valori inseriti dall'utente
            const junction = document.getElementById('val_junction').value;
            const year = document.getElementById('val_year').value;
            const hour = document.getElementById('val_hour').value;
            const day = document.getElementById('val_day').value;

            // 2. Creiamo l'array con le 4 features. 
            // IMPORTANTE: L'ordine deve essere identico a X_train!
            const arrayVariabili = [
                parseFloat(junction), 
                parseFloat(year), 
                parseFloat(hour), 
                parseFloat(day)
            ];

            try {
                // 3. Mandiamo i dati al server Python (Flask)
                const response = await fetch('http://localhost:5000/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ features: arrayVariabili })
                });
                
                // 4. Mostriamo il risultato
                const data = await response.json();
                document.getElementById('risultato').innerText = "🚗 " + Math.round(data.prediction) + " Veicoli previsti";
            } catch (error) {
                document.getElementById('risultato').innerText = "❌ Errore di connessione. Server Flask acceso?";
                console.error("Errore:", error);
            }
        }