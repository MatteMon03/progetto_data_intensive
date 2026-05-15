# Predizione del Traffico Urbano: Machine Learning & Deployment

Questo progetto implementa una pipeline completa di Machine Learning per la previsione del volume di traffico in corrispondenza di specifici incroci urbani. Il progetto copre l'intero ciclo di vita del dato: dall'Analisi Esplorativa (EDA) all'addestramento del modello, fino all'ottimizzazione e al deployment in produzione tramite un'architettura web a bassissima latenza.

## Caratteristiche Principali

* **Modello Predittivo:** Utilizzo di `XGBoost` ottimizzato tramite *Randomized Search* per la massima accuratezza (R² = 0.90).
* **Compilazione Nativa:** Conversione dell'albero decisionale in codice sorgente C tramite `Treelite` per abbattere i tempi di latenza e ridurre l'impronta in RAM.
* **API Server:** Backend implementato in `Flask` per gestire le richieste di inferenza in tempo reale.
* **Interfaccia Web:** Frontend reattivo in HTML/JS per interrogare il modello direttamente dal browser.

## Struttura del Repository

ROOT
│
├── .venv/                  # Ambiente virtuale Python (ignorato da Git)
├── archive/                # Backup e vecchi script di test
├── model_c_src/            # Codice sorgente C puro generato da tl2cgen (ignorato da Git)
│
├── WebSite/                # L'interfaccia utente web (Frontend)
│   ├── index.html          # Pagina principale della dashboard
│   ├── script.js           # Logica di comunicazione API
│   └── style.css           # Fogli di stile
│
├── app.py                  # Server Flask (Backend) per l'inferenza del modello
├── requirements.txt        # Dipendenze Python necessarie
├── MatteoMonari.ipynb      # Notebook Jupyter con EDA, training, tuning e profiling
└── xgb_model_ott.so        # Libreria dinamica C del modello compilato (ignorato da Git)

# Clona il repository

git clone `<https://github.com/MatteMon03/progetto_data_intensive.git>`
cd progetto_data_intensive

# Crea e attiva l'ambiente virtuale

python -m venv .venv
source .venv/bin/activate

# Installa le dipendenze

pip install -r requirements.txt

### 2. Addestramento e Compilazione (Opzionale)

Il file binario `xgb_model_ott.so` potrebbe non essere presente nel repository per motivi di versioning. Per generarlo:

1. Apri il notebook `MatteoMonari.ipynb`.
2. Esegui tutte le celle. L'ultima sezione si occuperà di addestrare il modello XGBoost e compilarlo in C tramite Treelite, salvando il file `.so` nella root del progetto.

### 3. Avviare il Server Web

Il backend Python deve essere in esecuzione per permettere al sito di effettuare le previsioni:
python app.py
Il server si avvierà su `http://127.0.0.1:5000`.

### 4. Avviare l'Interfaccia Utente

Apri il file `WebSite/index.html` nel tuo browser. Inserisci i parametri dell'incrocio e dell'orario per visualizzare la previsione del traffico in tempo reale.

## Performance (Benchmarking)

Lo script di profiling incluso nel notebook dimostra l'efficacia del deployment in C:

* **Throughput:** ~Migliaia di inferenze al secondo.
* **Latenza:** < 1 ms per singola previsione.
* **Dimensione:** Il modello non richiede il caricamento della libreria XGBoost in RAM sul server di produzione.

---

**Autore:** Matteo Monari
