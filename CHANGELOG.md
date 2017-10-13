# CHANGELOG

## In develop

## 1.0.9

* Minor style fixes.
* Fixed issue with change in group for user not being reflected in UI.
* Removed unnecessary call to get all slides in channelController.

## 1.0.8

* Fixed missing error message when trying to upload unsupported media files.

## 1.0.7

* Fixed bug with searching when on a page higher than the number of results,
where results are displayed as empty. Now pager is reset if text is changed.
* Added performance optimization where results are only loaded from the backend,
if the search ids are different than previous results.
