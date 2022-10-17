var cryptoZombies;
var userAccount;
const showZombieButton = document.querySelector('.showZombieButton');
const createzombieButton = document.querySelector('.createzombieButton');
const levelupButton = document.querySelector('.levelupButton');
const cryptokitty = document.querySelector('.cryptokitty');


$("#show-kitty").click(function () {

    let apiUrl = "https://api.cryptokitties.co/kitties/" + $("#kn").val()
    $.get(apiUrl, function (data) {
        let imgUrl = data.image_url
        $(".cryptokitty").attr("src", imgUrl);

        // do something to display the image
    })
});

function startApp() {
    //ZombieOwnership contratc address
    var cryptoZombiesAddress = "0xC08d276D3022F1E9E1e99eBAa6410fE4FcbEcB8f";
    cryptoZombies = new web3.eth.Contract(cryptoZombiesABI, cryptoZombiesAddress);
    cryptoZombies.events.Transfer({ filter: { _to: userAccount } })
        .on("data", function (event) {
            let data = event.returnValues;
            getZombiesByOwner(userAccount).then(displayZombies);
        }).on("error", console.error);
}

function displayZombies(ids) {
    $("#zombies").empty();

    console.log(ids);
    if (!ids.length) {
        $("#zombies").show();
        $("#zombies").append(`<div class="zombie text-center">No Record Found!! Please Create New Zombie.</div>`);
        return;
    }


    for (id of ids) {

        getZombieDetails(id)
            .then(function (zombie) {


                $("#zombies").show();
                $("#zombies").append(`<div class="zombie">
              <ul class="list-group">
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Name
                      <span class="badge badge-primary badge-pill">${zombie.name}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    DNA
                      <span class="badge badge-primary badge-pill">${zombie.dna}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Level
                      <span class="badge badge-primary badge-pill level">${zombie.level}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Wins
                      <span class="badge badge-primary badge-pill">${zombie.winCount}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Losses
                      <span class="badge badge-primary badge-pill">${zombie.lossCount}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    Ready Time
                      <span class="badge badge-primary badge-pill">${zombie.readyTime}</span>
                  </li>
              </ul>
            </div>`);

            });
    }

}

// Function to create a new Random Zombie
function createRandomZombie(name) {
    $("#txStatus").show();

    $("#load").show();
    $("#txStatus").html("Creating new zombie on the blockchain. <br/>This may take a while...");

    return cryptoZombies.methods.createRandomZombie(name)
        .send({ from: userAccount })
        .on("receipt", function (receipt) {
            $("#load").hide();
            $("#card-content").notify("Successfully created " + name + "!",
                {
                    position: "bottom",
                    autoHideDelay: 5000,
                    showAnimation: 'slideDown',
                    hideAnimation: 'slideUp',
                    className: 'success'
                });

            getZombiesByOwner(userAccount).then(displayZombies);
        })
        .on("error", function (error) {
            $("#load").hide();
            console.log(error);
            $("#card-content").notify("Zombie Creation Failed!",
                {
                    position: "bottom",
                    autoHideDelay: 5000,
                    showAnimation: 'slideDown',
                    hideAnimation: 'slideUp',
                    className: 'error'
                });
        });
}


// Function for feeding the Kitty
function feedOnKitty(zombieId, kittyId) {
    console.log(`hey ${zombieId} ${kittyId}`);
    $("#txStatus").text("Eating a kitty. This may take a while...");
    return cryptoZombies.methods.feedOnKitty(zombieId, kittyId)
        .send({ from: userAccount })
        .on("receipt", function (receipt) {
            console.log("Ate a kitty and spawned a new Zombie!");
            $("#txStatus").text("Ate a kitty and spawned a new Zombie!");
            getZombiesByOwner(userAccount).then(displayZombies);
        })
        .on("error", function (error) {
            console.log(`error ${zombieId} ${kittyId}`)
            $("#txStatus").text(error);
        });
}

// Function for levelling the Zombie Up
function levelUp(zombieId) {
    $("#txStatus").hide();
    $("#load").show();

    return cryptoZombies.methods.levelUp(zombieId)
        .send({ from: userAccount, value: web3.utils.toWei("0.001", "ether") })
        .on("receipt", function (receipt) {
            $("#load").hide();
            $(".level-anim").fadeIn();
            $("#notify-level").notify("Power overwhelming! Zombie successfully leveled up",
                {
                    position: "bottom left",
                    autoHideDelay: 5000,
                    showAnimation: 'slideDown',
                    hideAnimation: 'slideUp',
                    className: 'success'
                });
            $(".level-anim").fadeOut(2500);
            let zombieClass = `zombie-parts head-visible-${randomIntFromInterval(1, 7)} shirt-visible-${randomIntFromInterval(1, 6)} eye-visible-${randomIntFromInterval(1, 11)}`;
            console.log("zombieClass");
            $(".zombie-parts").attr("class", zombieClass);
            // $(".head,.eye,.shirt,.mouth,.left-upper-arm,.left-forearm,.right-forearm,.left-hand,.left-feet,.right-feet,.left-leg,.right-leg,.left-thigh,.right-thigh,.torso").attr("style", "filter : hue-rotate(" + (Math.random() * 1000).toFixed(2) + "deg)");
            getZombiesByOwner(userAccount).then(updateLevel);
            // $("#txStatus").text("");
        })
        .on("error", function (error) {
            $("#load").hide();
            $("#notify-level").notify("Zombie Level Up Failed!!",
                {
                    position: "bottom left",
                    autoHideDelay: 5000,
                    showAnimation: 'slideDown',
                    hideAnimation: 'slideUp',
                    className: 'error'
                });
        });
}

function getZombieDetails(id) {
    return cryptoZombies.methods.zombies(id).call()
}

function zombieToOwner(id) {
    return cryptoZombies.methods.zombieToOwner(id).call()
}

function getZombiesByOwner(owner) {
    return cryptoZombies.methods.getZombiesByOwner(owner).call()
}

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function setKittyContractAddress(id) {
    return cryptoKitties.methods.setKittyContractAddress(id).call()
}

window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            const accounts = await ethereum.enable();
            // Acccounts now exposed
            userAccount = accounts[0];
            startApp()
        } catch (error) {
            // User denied account access...
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        // Acccounts always exposed
        userAccount = web3.eth.accounts[0];
        startApp()
    }
    // Non-dapp browsers...
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
});

ethereum.on('accountsChanged', (accounts) => {
    window.location.reload();
});

ethereum.on('chainChanged', (chainId) => {
    window.location.reload();
});

createzombieButton.addEventListener('click', () => {
    createRandomZombie(userAccount);
});

showZombieButton.addEventListener('click', () => {
    getZombiesByOwner(userAccount)
        .then(displayZombies);
});

levelupButton.addEventListener('click', () => {
    getZombiesByOwner(userAccount)
        .then(levelUp);
});

cryptokitty.addEventListener('click', () => {
    getZombiesByOwner(userAccount)
        .then(setKittyContractAddress(cryptoZombiesAddress))
        .then(feedOnKitty(1, 1));
});

