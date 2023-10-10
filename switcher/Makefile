CXX := g++
FLAGS := -std=c++11 -O2 -fpermissive

all: build

build: main.cpp
	$(CXX) $(FLAGS) -o KeyboardSwitcher.exe $^

clean:
	del $(TARGET)

.PHONY: clean
