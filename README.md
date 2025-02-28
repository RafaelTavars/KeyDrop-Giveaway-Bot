# KeyDrop Giveaway Bot

Fork of Awesome bot made by mrFavoslav and Sajpro

with some changes and adds a minimum amount to participate in the giveaway.

# **WARNING: Contains internal jokes between friends!**
# **This fork is not serious or anything like that ... use the normal version**
-> https://github.com/mrFavoslav/KeyDrop-Giveaway-Bot <-

KeyDrop-BOT is a bot designed to interact with the **KeyDrop** platform, automate and perform tasks related to giveaways. It can automatically join giveaways based on the set interval. This project includes a **client-side JavaScript** script and a **server-side C#** application, which work together to perform the desired tasks.

## Features

### KeyDrop Bot Overview

- **Server-side C# Application**: 
  The server handles settings, interacting with the Client-side JavaScript. It hosts a WebSocket server that allows users to set parameters like cooldowns, giveaways to join, and other configuration options.

- **Client-side JavaScript**: 
  The client script, running through Tampermonkey, automates interactions on the KeyDrop website. It listens for settings from the server and performs automated tasks on the KeyDrop website.

- **Release Pipeline**: 
  The release pipeline, powered by GitHub Actions, automates the building and releasing of the latest versions of both the server-side application and the client-side script.

## Project Structure

```
KeyDrop-BOT/
├── .github/
│   └── workflows/
│       └── build-and-release.yml    # GitHub Actions workflow for building and releasing
├── app/
│   └── Guidzgo.sln                 # C# Solution file for the server-side application
├── script/
│   └── KeyDropBOT_client.js        # The main JavaScript client script
├── .gitignore                      # Git ignore configuration
├── README.md                       # Project readme (this file)
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support mrFavoslav

1. Referral

    <table>
      <tr>
        <td>
          <a href="https://key-drop.com/?code=FVSLV_">
            <img src="https://api.favoslav.cz/v1/assets/keydropbot/banner/1.png" alt="KeyDrop PROMO" width="150">
          </a>
        </td>
        <td style="vertical-align: middle; padding-left: 20px;">
            <a href="https://key-drop.com/?code=FVSLV_" style="margin-left: 20px; line-height: 200px;">
                Click here to visit KeyDrop with mrFavoslav referral code!
            </a>
        </td>
      </tr>
    </table>

2. KO-FI
   
    <a href="https://ko-fi.com/Y8Y7MIGB1"><img src="https://storage.ko-fi.com/cdn/kofi3.png?v=3" height="40" ></a>
