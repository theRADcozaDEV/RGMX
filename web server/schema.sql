CREATE TABLE IF NOT EXISTS game_scores (
    id VARCHAR(50) PRIMARY KEY,
    location VARCHAR(50),
    name VARCHAR(100),
    dept VARCHAR(100),
    score INT,
    date_played DATETIME,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
