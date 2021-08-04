thesis.pdf: *.tex $(shell find figures)
	pdflatex thesis.tex > /dev/null
	bibtex thesis > /dev/null
	pdflatex thesis.tex > /dev/null
	pdflatex thesis.tex >  /dev/null
	
debug: *.tex $(shell find figures)
	pdflatex thesis.tex
	bibtex thesis
	pdflatex thesis.tex
	pdflatex thesis.tex

	
all: thesis.pdf

clean:
	rm -rf *.bbl *.blg *.aux *.log *~ *.bak *.ps *.dvi *.log *.out *.tmp *.lof *.lot *.toc tex/*.aux

cleanall: clean
	rm -rf thesis.pdf
