from flask import Flask, request, jsonify
from flask_cors import CORS
import tl2cgen
import numpy as np

app = Flask(__name__)
CORS(app)

# Carichiamo il modello compilato
predictor = tl2cgen.Predictor(libpath="./xgb_model_ott.so")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # 1. Creiamo l'array numpy
        features_np = np.array(data['features'], dtype=np.float32).reshape(1, -1)
        
        # 2. Convertiamo nel formato DMatrix di Treelite
        dmat = tl2cgen.DMatrix(features_np)
        
        # 3. Facciamo la previsione (Treelite restituisce es. [[15.4]])
        prediction = predictor.predict(dmat)
        
        # IL FIX: .flatten() toglie tutte le parentesi extra, [0] prende il primo e unico numero
        risultato_pulito = float(prediction.flatten()[0])
        
        return jsonify({'prediction': risultato_pulito})
        
    except Exception as e:
        print(f"Errore durante la previsione: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)