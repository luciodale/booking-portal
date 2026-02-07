So I need you to come up with a solid multi step plan to refactor the system to account for the following:
- the user synch smoobu before they can post anything.
- before creating the apartment, they MUST select a smoobu property
- we need to create a seperate hotel schema (more comprehensive and smoobu matching) with apartment_id column as well (smoobu property id)
- the prices and calendar options are fetched by the client are never mnaged by us.
- Our current pricing system will only be used for experiences.

The smoobu full API reference is here: @docs/smoobu-docs.html 

Smoobu integration before uploading properties.
before the user can start uploading the properties I need to add a smoobu integration step in /backoffice view. if this is not completed, the four quadrants must be disabled.

the integration consists of an input element with the following helper text:
-> go to smoobu, advaced, API keys, generate API key. paste here.

we can manage this call directly from browser to smoobu no worker.

As per docs, call GET https://login.smoobu.com/api/me
 and display the response in the UI. {
    "id": 7,
    "firstName": "John",
    "lastName": "Doe",
    "email": "jhon@example.com"
}

ask the user to confirm it's them. Upon that we call a worker endpoint to store this entry in a new table we need to create where we keep track of 
broker id (clerk id really) foreign key of user table (for metadata we create one as well) 
PMC provider (smoobu) PMC api key (value)

if instead we get {
    "status": 401,
    "title": "Unauthorized",
    "detail": "Authentication required"
}

We show the error and tell the user maybe the api key is wrong.

Then, the user can finally create a property.
The first step of the existing form should be to call the smoobu endpoint from the client to fetch a list of all properties. 
The user chooses the property to connect and can continue filling out the form.

The following part is a plan on its own as it is pretty big:
All form values should be initiated from smoobu fields. 
The idea is that as smoobu already provides fields like title and so on, the user can simply check and finish filling out the data 
 This is an example payload:

 We can reorganize the form data model + schema (dedicate one separate table for the hotels) so we don't have complex mapping logic. we can use exactly these field names and what's not here in the payload we keep of course as we don't want to lose the extra information we are capturing, but we should add at least al these rooms fields. We can discard the price and currency and timezone.
 
{
    "location": {
        "street": "Wönnichstr. 68/70",
        "zip": "10317",
        "city": "Berlin",
        "country": "Germany",
        "latitude": "52.5200080000000",
        "longitude": "13.4049540000000"
    },
   "timeZone": "Europe/Berlin",
    "rooms": {
        "maxOccupancy": 4,
        "bedrooms": 4,
        "bathrooms": 2,
        "doubleBeds": 1,
        "singleBeds": 3,
        "sofaBeds": null,
        "couches": null,
        "childBeds": null,
        "queenSizeBeds": null,
        "kingSizeBeds": 1

    },
    "amenities": [
        "Internet",
        "Whirlpool",
        "Pool",
        "Heating"
    ],
    "currency": "EUR",
    "price": {
            "minimal": "10.00",
            "maximal": "100.00"
    },
    "type": {
        "id": 2,
        "name": "Holiday rental"
    }
}

---
Back to the main plan now:

So we have a form with all fields and pictures and we create our property!

the property is served via the elite/apt worker.
I need an astro react island to fetch the smoobu price and calendar details to display accurate information in the UI.

Future plan:
When selecting a range of dates and booking, the worker needs to call smoobu to fetch the price for a given date from there (we don't trust the client) and then it can start the stripe checkout flow.
on stripe checkout complete, we store a reference of the transaction in the db and immediately call smoobu to update the booking for the given property. whether the update is successful or not I store the log in a new table - something to track which booking was made that was or wasn't updated. Make sure the booking db entry also includes from date and to date of booking along with price paid currency stripe transaction id and anything that is sensible

I can then return a list of latest logs (notifications) for a given broker in the UI (say last 10) so they can see there's an issue and can go do the update manually. This user log table needs to be standardized as I could log multiple things so I need generic columns to track multiple event types.

I need you to know organize this plan in mutliple comprehensive stages and split it in multiple plans as wel and place them all in a new plans folder top-level