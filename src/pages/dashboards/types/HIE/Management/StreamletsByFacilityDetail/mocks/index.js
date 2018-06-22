import { endOfMonth, startOfMonth, subMonths } from "date-fns";

// Mock filters
export const mockFilters = {
  startDate: startOfMonth(subMonths(new Date(), 23)),
  endDate: endOfMonth(new Date()),
  organization: null
};

// Mock filters props.data
export const mockFiltersData = {
  "loading": false,
  "networkStatus": 7,
  "organizations": [
    {
      "name": "blh",
      "__typename": "Organization"
    },
    {
      "name": "Cognosante",
      "__typename": "Organization"
    },
    {
      "name": "Cognosante Dev",
      "__typename": "Organization"
    },
    {
      "name": "dd",
      "__typename": "Organization"
    },
    {
      "name": "ee",
      "__typename": "Organization"
    },
    {
      "name": "Ross Cardiology Center",
      "__typename": "Organization"
    }
  ],
  "__typename": "HieRoot"
};

// Mock Apollo response
export const mockData = {
  "loading": false,
  "documents": [
    {
      "user_name": "admin.robert.gates",
      "organization": null,
      "address": null,
      "country": null,
      "created": "08/02/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "amicone",
      "organization": "Cognosante",
      "address": null,
      "country": null,
      "created": "02/27/2018",
      "__typename": "UsersList"
    },
    {
      "user_name": "bsmagacz",
      "organization": null,
      "address": null,
      "country": null,
      "created": "08/24/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "ciprian",
      "organization": "cognosante",
      "address": null,
      "country": null,
      "created": "08/22/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "clinic",
      "organization": null,
      "address": null,
      "country": null,
      "created": "06/15/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "demo123",
      "organization": null,
      "address": null,
      "country": null,
      "created": "08/01/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "dennistest1",
      "organization": "cognosante",
      "address": null,
      "country": null,
      "created": "03/19/2018",
      "__typename": "UsersList"
    },
    {
      "user_name": "dhilberg",
      "organization": "Cognosante",
      "address": null,
      "country": null,
      "created": "03/14/2018",
      "__typename": "UsersList"
    },
    {
      "user_name": "dkleriga",
      "organization": "cognosante",
      "address": null,
      "country": null,
      "created": "03/16/2018",
      "__typename": "UsersList"
    },
    {
      "user_name": "dpedranti",
      "organization": "Cognosante Dev",
      "address": null,
      "country": "",
      "created": "02/02/2018",
      "__typename": "UsersList"
    },
    {
      "user_name": "gmcguffey",
      "organization": "Cognosante Dev",
      "address": null,
      "country": null,
      "created": "10/20/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "hiedemo",
      "organization": null,
      "address": null,
      "country": null,
      "created": "06/02/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "informprovider",
      "organization": "",
      "address": null,
      "country": "",
      "created": "02/06/2018",
      "__typename": "UsersList"
    },
    {
      "user_name": "IYVAz1niiC4_vik7uhWOhMh1fCYa",
      "organization": null,
      "address": null,
      "country": null,
      "created": "12/21/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "james.reynolds",
      "organization": null,
      "address": null,
      "country": null,
      "created": "08/01/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "janice.smith",
      "organization": "Cognosante",
      "address": "",
      "country": "",
      "created": "02/28/2018",
      "__typename": "UsersList"
    },
    {
      "user_name": "janice.white",
      "organization": null,
      "address": null,
      "country": null,
      "created": "08/01/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "jdean",
      "organization": "blh",
      "address": null,
      "country": "",
      "created": "09/25/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "jhuff",
      "organization": null,
      "address": null,
      "country": null,
      "created": "06/29/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "kcorbett",
      "organization": "Cognosante",
      "address": null,
      "country": "",
      "created": "11/28/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "kenneth.ross",
      "organization": null,
      "address": null,
      "country": null,
      "created": "08/01/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "mkalinowski",
      "organization": "Cognosante Dev",
      "address": "1028 NE 14TH AVE, GAINESVILLE, FL, 32601",
      "country": "US",
      "created": "02/15/2018",
      "__typename": "UsersList"
    },
    {
      "user_name": "peter.anderson",
      "organization": null,
      "address": null,
      "country": null,
      "created": "08/01/2017",
      "__typename": "UsersList"
    },
    {
      "user_name": "sestest",
      "organization": null,
      "address": null,
      "country": null,
      "created": "08/03/2017",
      "__typename": "UsersList"
    }
  ]
};