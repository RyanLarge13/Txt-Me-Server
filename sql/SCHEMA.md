# DB Schema

```
CREATE TABLE IF NOT EXISTS Users (
    userId SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verifiedPhone BOOLEAN NOT NULL DEFAULT false, 
    verifiedEmail BOOLEAN NOT NULL DEFAULT false, 
    phoneNumber VARCHAR(10) NOT NULL
    passcode VARCHAR(6),
    passExpiresAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    passUsed BOOLEAN
);

CREATE TABLE IF NOT EXISTS Contacts (
    contactId SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    number INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    space VARCHAR(255) DEFAULT 'primary',
    userId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

CREATE TABLE IF NOT EXISTS Messages (
    messageId SERIAL PRIMARY KEY,
    message VARCHAR(5000) NOT NULL,
    sent BOOLEAN,
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered BOOLEAN DEFAULT false,
    deliveredAt TIMESTAMP,
    read BOOLEAN DEFAULT false,
    readAt TIMESTAMP,
    fromId INT NOT NULL,
    toId INT NOT NULL,
	FOREIGN KEY (fromId) REFERENCES Users(userId),
    FOREIGN KEY (toId) REFERENCES Users(userId)
);
```
