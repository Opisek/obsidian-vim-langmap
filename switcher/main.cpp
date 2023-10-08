#include <Windows.h>
#include <WinUser.h>
#include <wchar.h>

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

	wchar_t parentPath[MAX_PATH + 1];
	GetModuleFileNameW(NULL, parentPath, MAX_PATH);
	wchar_t* ptr = wcsrchr(parentPath, '\\');
	*ptr = '\0';
	wchar_t executablePath[MAX_PATH + 100];
	if (offset < 0) swprintf_s(executablePath, L"%s\\PreviousLayout.exe", parentPath);
	else swprintf_s(executablePath, L"%s\\NextLayout.exe", parentPath);

	if (offset < 0) offset *= -1;
	for (int i = 0; i < offset; ++i) _wsystem(executablePath);

	return 0;
}