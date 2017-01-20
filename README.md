# PointOut
Create links that PointOut and highlight an area inside a page (This is a Chrome Addon)

There is 3 parts to this technology

## Creating the link
The user toggles the selection mode
The user selects an element in the page
Information about the page and selected element is stored in a database
A sharable shortened url is created

## Using the link without the Addon installed
When a user navigates to a pointout shortened url a page a displayed with a the content of the element looking exactly as it was inside the original page.
The user is invited to install the plugin to be able to see the content inside the original page in highlighted format

## Using the link with the addon installed
The user is redirected to the original page with the ?pointout={id} parameter appened to the url querystring
The Addon picks up the parameter, looks up information about how to find the element inside the page
The addon then scrolls to and highlights the area inside the page
