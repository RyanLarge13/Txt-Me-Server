CREATE TABLE
    IF NOT EXISTS Users (
        userId VARCHAR(255) PRIMARY KEY NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        phoneNumber INT NOT NULL
    );

CREATE TABLE
    IF NOT EXISTS Contacts (
        contactId VARCHAR(255) PRIMARY KEY NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        number INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        space VARCHAR(255) DEFAULT 'primary',
        nickname VARCHAR(255),
        address VARCHAR(255),
        website VARCHAR(255),
        avatar VARCHAR(255),
        synced BOOLEAN DEFAULT false,
        userId INT NOT NULL,
        FOREIGN KEY (userId) REFERENCES Users (userId)
    );

CREATE TABLE
    IF NOT EXISTS Messages (
        messageId VARCHAR(255) PRIMARY KEY NOT NULL,
        message VARCHAR(5000) NOT NULL,
        sent BOOLEAN,
        sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivered BOOLEAN DEFAULT false,
        deliveredAt TIMESTAMP,
        read BOOLEAN DEFAULT false,
        readAt TIMESTAMP,
        fromId INT NOT NULL,
        toId INT NOT NULL,
        FOREIGN KEY (fromId) REFERENCES Users (userId),
        FOREIGN KEY (toId) REFERENCES Users (userId)
    );