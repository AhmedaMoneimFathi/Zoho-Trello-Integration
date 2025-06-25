

### 0. Initial Research

Before starting, I explored the official API documentation for both [Zoho CRM](https://www.zoho.com/crm/developer/docs/api/v2/) and [Trello](https://developer.atlassian.com/cloud/trello/rest/api-group-boards/). This helped me understand how to authenticate, retrieve CRM deals, create Trello boards, and update CRM fields programmatically, and also explored more about Zoho and Trello.
- For testing purposes only, I pushed both the `.env` file and a utility script named `getrefreshtoken.js` (used to obtain the Zoho refresh token via Postman). These files contain sensitive data and **should not be included in production** or public repositories under normal circumstances. They were committed only to allow the reviewers to run and test the application directly.
---


## ⚙️ Setup Steps

### 1. Project Folder Setup

1. Created a new project directory:
   ```bash
   mkdir zoho-trello-integration
   cd zoho-trello-integration

2. Initialized a new Node.js project
3. Installed the required dependencies:
   - `dotenv`
   - `cors`
   - `axios`
   - `express`







---
### 2. Create a Zoho Account and Developer Client

1. First, create a [Zoho account](https://www.zoho.com/signup.html) if you don't have one already.
2. Then, go to the [Zoho API Console](https://api-console.zoho.com/).
3. Click on **Add Client**.
4. Select:
   - **Client Type:** `Server-based Applications`
   - **Redirect URI:** `http://localhost:3000`
5. After creation, save the generated:
   - `Client ID`
   - `Client Secret`
6. Go To One Zoho then to applications tab and create Crm application

---

### 3. Generate Zoho Refresh Token

1. Open this URL (https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=http://localhost:3000
) in your browser (replace `YOUR_CLIENT_ID`):
2. After logging in and approving access, you'll be redirected to: http://localhost:3000/?code=YOUR_GENERATED_CODE
3. Open Postman, create a POST request to: https://accounts.zoho.com/oauth/v2/token
4. In the **Body** tab, select `x-www-form-urlencoded` and fill in the following fields:

| Key           | Value                  |
|---------------|------------------------|
| grant_type    | authorization_code     |
| client_id     | YOUR_CLIENT_ID         |
| client_secret | YOUR_CLIENT_SECRET     |
| redirect_uri  | http://localhost:3000  |
| code          | YOUR_GENERATED_CODE    |

5. Click Send, and you will receive a response containing your:
    - `Refresh Token`
   - `Access Token`

---

### 4. Configure Environment Variables

After obtaining the `client_id`, `client_secret`, and `refresh_token` from Zoho (and Trello keys too), I stored them in a `.env` file for security and ease of use. Here's an example of the `.env`:

ZOHO_CLIENT_ID=your_client_id_here

ZOHO_CLIENT_SECRET=your_client_secret_here

ZOHO_REFRESH_TOKEN=your_refresh_token_here

ZOHO_REDIRECT_URI=http://localhost:3000


--- 

### 5. Configure Zoho CRM Deal Layout

After setting up the API credentials, I customized the **Deals** module in Zoho CRM to meet the project requirements:

1. Navigated to the **Zoho CRM Dashboard** → **Settings** → **Modules** → **Deals** → **Edit Layout**.
2. Made the following changes:
   - **Added a new field**: Dragged a **Single Line** field into the layout and named its **API name** `Project_Board_ID__c`. This field will store the Trello board ID.
   - **Modified the `Type` field**: Added a new dropdown value `New Implementation Project`.
   - **Modified the `Stage` field**: Added a new dropdown value `Project Kickoff`.

These adjustments ensure the script can properly identify relevant deals and update them with Trello board information.


---

### 6. Add a Sample Deal with Required Values

To trigger the integration, I manually added a test deal in Zoho CRM that meets the required conditions for the script to act on it:

1. Went to **Deals** in Zoho CRM and clicked **+ New Deal**.
2. Filled in the following fields:
   - **Deal Name**: `Test 1` (or any unique name)
   - **Stage**: `Project Kickoff`
   - **Type**: `New Implementation Project`
   - **Project_Board_ID__c**: *(Leave this field blank)*

By ensuring these specific values, the script identifies the deal as eligible for integration and proceeds to create a Trello board, then updates the Zoho deal with the board ID.
---

### 7. Test Fetch Functionality

To verify the connection with Zoho CRM and ensure the API credentials were working, I implemented and tested the `fetchDeals()` function inside `zohoservice.js`.

This function retrieves all deals and filters those with:
- `Stage` = `Project Kickoff`
- `Type` = `New Implementation Project`
- `Project_Board_ID__c` = *(empty)*

It confirmed that data was being successfully fetched from Zoho CRM and ready for integration logic.
---

### 8. Create Trello Account & Generate API Credentials

1. Created a [Trello account](https://trello.com/signup) (if not already registered).
2. Visited the [Trello Developer API Keys page](https://trello.com/app-key).
3. Retrieved the `API Key` and generated a `Token` using the provided link on that page.

These credentials were then added to the `.env` file to enable secure communication with Trello's API for board creation and card management.
---

### 9. Implement Trello Board Creation Logic

In the `trelloService.js` file, I implemented a function that:

- Creates a new Trello board using the deal's name.
- Adds three default lists: **To Do**, **In Progress**, and **Done**.
- Populates the **To Do** list with three starter cards.
- Returns the newly created board ID to be stored back in Zoho CRM.

This logic ensures that each relevant Zoho deal is automatically matched with a structured Trello board.
---

### 10. Connect Everything: Backend Script and Frontend Integration

Initially, I ran the project by executing `index.js` directly from the terminal. This handled the integration by:

- Fetching deals from Zoho CRM
- Creating Trello boards for matching deals
- Updating the Zoho records with the new board ID

To enhance usability and presentation, I created:

- A simple `frontend` using HTML/CSS to include a visual **Integrate** button
- A `server.js` file using Express that handles the `/integrate` POST route, triggering the full integration flow

This made the project more interactive, allowing integration via the browser with visual feedback.
---

## ▶️ How to Run the Script

You can run this project in **two different ways**:

### Option 1: Backend-Only (Terminal)

1. Open your terminal.
2. Run the integration script:

node index.js

and all the results appear in the terminal

### Option 2: With Frontend Interface (Web Page)

1. Run the server:

`node server.js`

2. Open your browser and navigate to:

`http://localhost:3000`

3. Click the **Integrate** button on the page.

- This triggers a POST request to the backend (`/integrate` route).
- The server fetches deals from Zoho CRM, checks if a Trello board already exists, and if not:
  - Creates a new Trello board.
  - Updates the `Project_Board_ID__c` field in the CRM deal.
- The page displays the integration status visually and with output messages.

## 📝 Notes or Known Issues

- While editing the layout of the **Deals** module in Zoho CRM, I initially had trouble adding the correct dropdown values for the `Type` and `Stage` fields because the expected values ("New Implementation Project" and "Project Kickoff") were not visible. I resolved this by manually adding them in the layout editor.

- The `Project_Board_ID__c` field was not updating at first, even though the logs confirmed a successful update. After investigation, I discovered that the actual **API name** was `Project_Board_ID_c` (with a single underscore before `c`). Once corrected, the board ID was successfully inserted.

- If the integration script is run multiple times without checking for existing board IDs, it may create **duplicate Trello boards** for the same deal. This was later handled in the logic to skip deals that already have a board assigned.

- Be sure to verify **field API names** in Zoho's layout editor under field properties, as they may differ from the display label.

- For consistent results, make sure all dropdown options (like Stage and Type) exactly match the values expected by the script.
- For testing purposes only, I pushed both the `.env` file and a utility script named `getrefreshtoken.js` (used to obtain the Zoho refresh token and also used Postman). These files contain sensitive data and **should not be included in production** or public repositories under normal circumstances. They were committed only to allow the reviewers to run and test the application directly.

