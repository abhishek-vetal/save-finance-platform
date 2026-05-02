import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

export default function Header() {
    return (
        <>
            <Show when="signed-out">
              <SignInButton />
              <SignUpButton>
                Sign-up
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
        </>
    )
}