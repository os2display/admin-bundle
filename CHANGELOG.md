# CHANGELOG

## 1.0.7

* Fixed bug with searching when on a page higher than the number of results,
where results are displayed as empty. Now pager is reset if text is changed.
* Added performance optimization where results are only loaded from the backend,
if the search ids are different than previous results.
