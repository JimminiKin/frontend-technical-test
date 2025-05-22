# Meme feed code review

The implementation of this route has many issues. Some are making it completely unusable and dangerous for the health of the API. Others are making it and the codebase around it hard to maintain.

## Issues

- ### Overfetching

First and most damning issue : the route is fetching ALL the data from the API. It would be bad enough to fetch all memes at once, but the implementation also fetches author, all comments and all comments author. Also no cache is in place to avoid refetching already fetched users.

- ### State organization

Following the way everything is overfetched, everything is stored in one query cache key. This means access to a small part of the data graph requires fecthing everything AND any modification also means refetching everything to update the data.

- ### Mutation and memes caching

Commenting will not trigger a refetch of the matching data and will not update the memes cache, UI will not be updated accordingly

- ### Error handling

There is no error handling anywhere. Any error with the API will result in the app breaking without recourse for the user.

- ### Many concerns in one place

This components has all logic and presentation coded in place in one file. Nothing here is reusable anywhere

## Recommendations

- ### Overfetching and State organization

Split fetched data cache and queries in schema related entities. Have a `meme/:id` cache key for memes, `user/:id` for users, etc. etc.

Fetch first pages of memes only and implement infinite loading of next pages when scrolling close to bottom. (can be a fetch more button in a first implementation)

Fetch data for comments only when a meme comment section is opened, and fetch only first pages with a fetch more button. (Here we could have imagined another inifinite fetching but double infinite loading tend to create unpredictable experience for users)

- ### Mutation and memes caching

Make sure mutation updates the related cache and ONLY the related cache.

- ### Error handling

Implement at least a basic error handling and either display an error message when API error happens and possibly implement a retry feature.

- ### Many concerns in one place

Split display in multiple composable components.

    - Meme display
    - Comment display
    - Comment author
    - etc.

Isolate hooks most susceptible to reuse across the app in specific files (i.e.: current user query)