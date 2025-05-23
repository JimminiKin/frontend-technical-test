import { screen, waitFor, fireEvent, act } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AuthenticationContext } from "../../../contexts/authentication";
import { MemeCreatePage } from "../../../routes/_authentication/create";
import { renderWithRouter } from "../../utils";

const navigateMock = vi.fn();
describe("routes/_authentication/create", () => {
  describe("CreateMemePage", () => {
    function renderMemeCreatePage() {
      return renderWithRouter({
        component: MemeCreatePage,
        currentUrl: "/create",
        onNavigate: navigateMock,
        Wrapper: ({ children }) => (
          <ChakraProvider>
            <QueryClientProvider client={new QueryClient()}>
              <AuthenticationContext.Provider
                value={{
                  state: {
                    isAuthenticated: true,
                    userId: "dummy_user_id",
                    token: "dummy_token",
                  },
                  authenticate: () => {},
                  signout: () => {},
                }}
              >
                {children}
              </AuthenticationContext.Provider>
            </QueryClientProvider>
          </ChakraProvider>
        ),
      });
    }
    it.only("should display the new meme when submitted", async () => {
      renderMemeCreatePage();
      const mockFile = new File([''], 'test.png', { type: 'image/png' });
      const fileInput = screen.getByLabelText(/upload image/i);
      const descriptionInput = screen.getByLabelText(/Description/i);
      const newCaptionButton = screen.getByLabelText(/Add Caption/i);
      const submitButton = screen.getByLabelText(/Submit/i );

      expect(navigateMock).toHaveBeenCalledWith(expect.objectContaining({toLocation: expect.objectContaining({href: '/create'})}))

      navigateMock.mockClear();

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
        fireEvent.change(descriptionInput, { target: { value: 'Test Meme' } });
      });
      await act(async () => {
        fireEvent.click(newCaptionButton);
      });
      
      const newCaptionInput = screen.getByLabelText(/Caption 1/i);

      await act(async () => {
        fireEvent.change(newCaptionInput, { target: { value: 'Test Caption' } });
      });
      await act(async () => {
        fireEvent.click(submitButton);
      });
 
      await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith(
          expect.objectContaining({
            fromLocation: expect.objectContaining({href: '/create'}),
            toLocation: expect.objectContaining({href: '/'})
          })
        )
      });      
    });
  });
});
