from flask import Flask, request, jsonify
from flask_cors import CORS
import tl2cgen
import numpy as np

app = Flask(__name__)
CORS(app)
predictor = tl2cgen.Predictor(libpath="./xgb_model_ott.so")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        features_np = np.array(data['features'], dtype=np.float32).reshape(1, -1)
        dmat = tl2cgen.DMatrix(features_np)
        prediction = predictor.predict(dmat)
        ris = float(prediction.flatten()[0])
        return jsonify({'prediction': ris})
        
    except Exception as e:
        print(f"Errore durante la previsione: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)