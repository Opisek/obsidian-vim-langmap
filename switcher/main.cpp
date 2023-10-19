#include <Windows.h>
#include <WinUser.h>
#include <wchar.h>
#include <iostream>

wchar_t* getExecutablePath(const wchar_t* filename) {
	wchar_t parentPath[MAX_PATH + 1];
	GetModuleFileNameW(NULL, parentPath, MAX_PATH);
	wchar_t* ptr = wcsrchr(parentPath, '\\');
	*ptr = '\0';
	size_t parentPathLength = ptr - parentPath;
	wchar_t escapedParentPath[parentPathLength * 2 + 1];
	int j = 0;
	for (int i = 0; parentPath[i] != '\0'; ++i) {
		if (parentPath[i] == '\\') escapedParentPath[j++] = '\\';
		escapedParentPath[j++] = parentPath[i];
	}
	escapedParentPath[j] = '\0';
	size_t executablePathLength = j + wcslen(filename) + 5;
	wchar_t* executablePath = (wchar_t*)malloc(executablePathLength * sizeof(wchar_t));
	swprintf_s(executablePath, executablePathLength, L"\"%s\\\\%s\"", escapedParentPath, filename);
	return executablePath;
}

int main(int argc, char** argv) {
	// Get current layout
	HWND hwnd = GetForegroundWindow();
	DWORD threadID = GetWindowThreadProcessId(hwnd, NULL);
	HKL currentLayoutHKL = GetKeyboardLayout(threadID);
	unsigned int currentLayout = (unsigned int)currentLayoutHKL & 0x0000FFFF;

	// Parse arguments
	if (argc < 2) return -1;
	unsigned int requestedLayout = atoi(argv[1]);
	
	int offset = 0;
	if (argc >= 3) offset = atoi(argv[2]);

	// Switch Language
	if (requestedLayout == currentLayout) return 0;
	LPARAM selectedLayout = ((LPARAM)requestedLayout);
	PostMessage(hwnd, WM_INPUTLANGCHANGEREQUEST, INPUTLANGCHANGE_FORWARD, selectedLayout);

	if (offset == 0) return 0;

	while (GetAsyncKeyState(VK_MENU) & 0x8000 || GetAsyncKeyState(VK_SHIFT) & 0x8000) Sleep(100);

	wchar_t* executablePath;
	if (offset > 0) {
		executablePath = getExecutablePath(L"NextLayout.exe");
	} else {
		executablePath = getExecutablePath(L"PreviousLayout.exe");
		offset *= -1;
	}
	std::wcout << executablePath << std::endl;
	for (int i = 0; i < offset; ++i) _wsystem(executablePath);
	free(executablePath);

	return 0;
}