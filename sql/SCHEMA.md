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
    phoneNumber VARCHAR(15) NOT NULL UNIQUE
    passcode VARCHAR(6),
    passExpiresAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    passUsed BOOLEAN,
    passemailcode VARCHAR(6),
    passEmailExpiresAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    passEmailUsed BOOLEAN;
);
```

```
CREATE TABLE IF NOT EXISTS Contacts (
    contactId SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    number VARCHAR(15) NOT NuLL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    space VARCHAR(255) DEFAULT 'primary',
    nickname VARCHAR(255),
    address VARCHAR(255),
    website VARCHAR(255),
    avatar VARCHAR(255);
    userId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(userId)
);
```

```
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
    fromNumber VARCHAR(15) NOT NULL,
    toNumber VARCHAR(15) NOT NULL,
    FOREIGN KEY (fromNumber) REFERENCES Users(phoneNumber),
    FOREIGN KEY (toNumber) REFERENCES Users(phoneNumber),
	FOREIGN KEY (fromId) REFERENCES Users(userId),
    FOREIGN KEY (toId) REFERENCES Users(userId)
);
```
