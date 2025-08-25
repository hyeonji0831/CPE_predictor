from flask import Flask, render_template, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__, template_folder='templates', static_folder='static')

app.config.update(
    TEMPLATES_AUTO_RELOAD=True,
    SEND_FILE_MAX_AGE_DEFAULT=0,  # 정적파일 캐시 제거(개발용)
)
app.jinja_env.auto_reload = True


# 1) 모델 로드
with open('cpe_model.pkl', 'rb') as f:
    model_data = pickle.load(f)

model = model_data['model']
features = model_data['features']              # 학습에 사용된 정확한 컬럼명
threshold = float(model_data.get('threshold', 0.5))

# 2) 프론트 → 모델 피처명 매핑 (HTML/JS 키 ↔ 학습 피처명)
ALIASES = {
    'hospital-days': 'Hospital days before ICU admission',
    'ltcf': 'Admission to long-term care facilities within one year',
    'esrd': 'ESRD on renal replacement',
    'steroid': 'Steroid use within 3 months',
    'vre': 'VRE colonization within 6 months',
    'endoscopy': 'Endoscopy within 1 year',
    'cvc': 'Central venous catheter',
    'ngt': 'Nasogastric tube',
    'ptbd': 'PTBD (percutaneous transhepatic biliary drain)',
    'blactam': 'β-lactam/β-lactamase inhibitor',
    'ceph': 'Cephalosporin',
    'fq': 'Fluoroquinolone',
    'carb': 'Carbapenem',
    'amino': 'Aminoglycoside',
}

# 병원일수 다양한 키 허용
HOSPITAL_DAYS_KEYS = ['hospital-days', 'hospital_days', 'hospitalDays']

def _safe_int(x, default=0):
    try:
        return int(x)
    except (TypeError, ValueError):
        return default

def build_row(payload: dict) -> dict:
    """프론트 payload를 모델 입력 1행(dict)으로 변환."""
    row = {f: 0 for f in features}  # 기본값 0

    # 2-1) hospital days
    hosp = 0
    for k in HOSPITAL_DAYS_KEYS:
        if k in payload and payload[k] not in (None, ''):
            hosp = _safe_int(payload[k], 0)
            break
    if 'Hospital days before ICU admission' in row:
        row['Hospital days before ICU admission'] = hosp

    # 2-2) 나머지 이진 피처
    for alias, full in ALIASES.items():
        if alias in HOSPITAL_DAYS_KEYS:
            continue
        if alias in payload:
            row[full] = _safe_int(payload.get(alias, 0), 0)

    return row

@app.after_request
def add_no_cache_headers(resp):
    # 프론트 실시간 반영 시 캐시 문제 방지
    resp.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    resp.headers['Pragma'] = 'no-cache'
    resp.headers['Expires'] = '0'
    return resp

@app.route('/')
def index():
    # 기존 템플릿 렌더 (프론트에서 JS가 /predict 호출)
    return render_template('index.html')

@app.route('/features', methods=['GET'])
def get_features():
    """프론트에서 피처 순서/이름 확인 필요할 때 사용(선택)."""
    return jsonify({
        "features": features,
        "aliases": ALIASES,
        "threshold": threshold
    })

@app.route('/predict', methods=['POST'])
def predict():
    # JSON 또는 폼-URL Encoded 모두 허용
    payload = request.get_json(silent=True)
    if payload is None:
        payload = request.form.to_dict()  # fallback

    if not isinstance(payload, dict):
        return jsonify({"error": "Invalid payload format"}), 400

    # 입력 가공 → DataFrame(칼럼 순서 = features)
    row_dict = build_row(payload)
    X = pd.DataFrame([row_dict], columns=features)

    # 예측 (threshold 반영)
    proba = float(model.predict_proba(X)[0][1])
    pred = 1 if proba >= threshold else 0
    status = "CPE positive" if pred else "CPE negative"

    # 프론트가 바로 쓰기 좋게 필드명 통일
    return jsonify({
        "status": status,
        "probability": round(proba * 100, 1),  # %
        "threshold": threshold,
        "icon": "positive" if pred else "negative"
    })

@app.route('/health')
def health():
    return jsonify({"ok": True})

if __name__ == '__main__':
    print("Loaded features:", features)
    app.run(debug=True)
