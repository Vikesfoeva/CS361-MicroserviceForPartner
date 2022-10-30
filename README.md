# CS361 Patient Search Microservice For Partner's Project
Goal
Searches an a MongoDB collection for patient(s) given the user search criteria.
<br><br>
Logic<br>
FirstName & LastName are both case agnostic and searched based on includes such that a search for jO could return the name John.  The MemberID field is also case agnostic and also searches for substrings.  The DOB must be exact.   If a patient matches on 1 search criteria, but not on the 2nd then they will be excluded.  A list of all patients who aare valid options for all search criteria is who is returned.
<br><br>
Full Documentation & UML<br>
https://docs.google.com/document/d/1-2ZHJF13ApBrIDLMhRwlUFmMF-vsD6RfYZenBaezQm8/edit#
<br><br>
URL<br>
https://lenzb-cs361-microservice.ue.r.appspot.com
<br><br>
Available Endpoints<br>
POST /patients (see full documentation link for information on how to call the endpoint and what response to expect)
