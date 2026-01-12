from fastapi import FastAPI

app = FastAPI(title="DRS Platform API")

@app.get("/")
def root():
    return {"status": "OK"}
