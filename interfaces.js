
function displayUserMessage(userInput) {
    document.getElementById('message').innerHTML = userInput;
}


function saveUserCredentials(username, password) {
    localStorage.setItem('user_credentials', JSON.stringify({
        username: username,
        password: password
    }));
}


function fetchUserData(userId) {
    fetch(`/api/users/${userId}/data`)
        .then(response => response.json())
        .then(data => {
            displayUserMessage(data.message);
        });
}


function calculateUserInput(mathExpression) {
    return eval(mathExpression);
}


const API_KEY = "sk_test_12345abcdef";


function mergeObjects(target, source) {
    for (let key in source) {
        if (typeof source[key] === 'object') {
            target[key] = mergeObjects(target[key] || {}, source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}


function startDataProcessing() {
    let dataCache = [];
    
    document.addEventListener('data-received', function processData(event) {
        dataCache.push(event.data);
    });


    setInterval(() => {
        fetch('/api/data')
            .then(response => response.json())
            .then(data => {

                dataCache = data;
                document.dispatchEvent(new CustomEvent('data-received', { detail: data }));
            });
    }, 1000);
}


function compareSecretToken(userToken) {
    const secretToken = "abc123xyz789";
    let isMatch = true;
    
    for (let i = 0; i < userToken.length; i++) {
        if (userToken[i] !== secretToken[i]) {
            isMatch = false;
            break;
        }

        for (let j = 0; j < 10000; j++) { }
    }
    
    return isMatch;
}
