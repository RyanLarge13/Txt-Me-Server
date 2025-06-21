CREATE TABLE
    IF NOT EXISTS Users (
        userId VARCHAR(255) PRIMARY KEY NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        phoneNumber VARCHAR(15) NOT NULL UNIQUE,
        passemailcode VARCHAR(6),
        passEmailExpiresAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        passEmailUsed BOOLEAN,
        passcode VARCHAR(6),
        passExpiresAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        passUsed BOOLEAN,
        verifiedPhone BOOLEAN NOT NULL DEFAULT false,
        verifiedEmail BOOLEAN NOT NULL DEFAULT false
    );

CREATE TABLE
    IF NOT EXISTS Contacts (
        contactId VARCHAR(255) PRIMARY KEY NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        number VARCHAR(15) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        space VARCHAR(255) DEFAULT 'primary',
        nickname VARCHAR(255),
        address VARCHAR(255),
        website VARCHAR(255),
        avatar VARCHAR(255),
        synced BOOLEAN DEFAULT false,
        userId VARCHAR(255) NOT NULL,
        FOREIGN KEY (userId) REFERENCES Users (userId)
    );

CREATE TABLE
    IF NOT EXISTS Messages (
        messageId VARCHAR(255) PRIMARY KEY NOT NULL,
        message VARCHAR(5000) NOT NULL,
        fromId VARCHAR(255) NOT NULL,
        toId VARCHAR(255) NOT NULL,
        fromNumber VARCHAR(15) NOT NULL,
        toNumber VARCHAR(15) NOT NULL,
        FOREIGN KEY (fromNumber) REFERENCES Users (phoneNumber),
        FOREIGN KEY (toNumber) REFERENCES Users (phoneNumber),
        FOREIGN KEY (fromId) REFERENCES Users (userId),
        FOREIGN KEY (toId) REFERENCES Users (userId)
    );