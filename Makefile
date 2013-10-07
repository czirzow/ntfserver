TAG=$(shell git tag | PATH="/usr/local/opt/coreutils/libexec/gnubin:$(PATH)" sort --version-sort | tail -n 1)

build: clean static_setup
	git archive --format=tar --prefix="ntfserver-$(TAG)/" "$(TAG)" > "ntfserver-$(TAG).tar"
	tar -xf "ntfserver-$(TAG).tar"
	rm -f "ntfserver-$(TAG).tar"
	cp deps/vendor.css "ntfserver-$(TAG)/static/vendor.css"
	cp deps/vendor.js "ntfserver-$(TAG)/static/vendor.js"
	tar -czf "ntfserver-$(TAG).tgz" "ntfserver-$(TAG)/"
	rm -fr "ntfserver-$(TAG)"

static_setup:
	bower install
	grunt build

static: static_setup
	#rm -fr deps bower_components

clean:
	rm -fr deps bower_components static/vendor.*

.PHONY: build clean static static_setup
