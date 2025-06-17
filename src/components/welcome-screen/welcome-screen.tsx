'use client';

import Xarrow from 'react-xarrows';
import classNames from 'classnames';

interface WelcomeScreenProps {
	show: boolean;
	className?: string;
}

export const WelcomeScreen = ({ show, className }: WelcomeScreenProps) => {
	if (!show) return null;

	return (
		<div
			className={classNames(
				'animate-fade-in pointer-events-none absolute inset-0 z-20',
				className,
			)}
		>
			{/* Anchor points for arrows - Small screens */}
			<div
				id="mobile-input-target"
				className="absolute bottom-40 left-3/5 block h-1 w-1 md:hidden"
			/>
			<div
				id="mobile-menu-target"
				className="absolute top-8 left-20 block h-1 w-1 md:hidden"
			/>

			{/* Anchor points for arrows - Medium+ screens */}
			<div
				id="chat-history-target"
				className="absolute top-32 left-4 hidden h-1 w-1 md:left-[12rem] md:block"
			/>
			<div
				id="input-area-target"
				className="absolute bottom-40 left-8/11 hidden h-1 w-1 md:block"
			/>
			<div
				id="settings-target"
				className="absolute bottom-36 left-6 hidden h-1 w-1 md:left-[14rem] md:block"
			/>

			{/* Small screen annotations */}
			<div
				id="input-help-text"
				className="absolute bottom-64 left-1/2 block -translate-x-1/2 md:hidden"
			>
				<div className="text-tooltip font-slab text-md py-4 text-center">
					<div className="font-semibold">Start Chatting</div>
					<div className="text-sm">Type your message below</div>
				</div>
			</div>

			<div
				id="menu-help-text"
				className="absolute top-16 left-1/2 block md:hidden"
			>
				<div className="text-tooltip font-slab text-md px-4 text-left">
					<div className="font-semibold">Menu</div>
					<div className="text-sm">Tap here to open</div>
				</div>
			</div>

			{/* Medium+ screen annotations */}
			<div
				id="chat-history-text"
				className="absolute top-50 left-4 hidden md:left-[calc(20rem+2rem)] md:block"
			>
				<div className="text-tooltip font-slab px-4 text-xl">
					<div className="font-semibold">Chat History</div>
					<div className="text-sm">
						Your previous conversations will appear here
					</div>
				</div>
			</div>

			{/* Main welcome message */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				<div className="bg-glass-pane font-slab rounded-xl border p-6 text-center shadow-lg backdrop-blur-md">
					<div className="mb-2 text-xl font-bold">Welcome to tfree.chat!</div>
					<div className="text-foreground/75 max-w-sm text-sm">
						Your AI-powered chat experience starts here. Ask questions, get
						help, or just have a conversation!
					</div>
				</div>
			</div>

			{/* Input area annotation */}
			<div
				id="input-text"
				className="absolute bottom-80 left-7/11 hidden -translate-x-1/2 py-4 md:block"
			>
				<div className="text-tooltip font-slab text-center text-xl">
					<div className="font-semibold">Start Here</div>
					<div className="text-sm">Get started by typing something below</div>
				</div>
			</div>

			{/* Settings annotation */}
			<div
				id="settings-text"
				className="absolute bottom-64 left-12 hidden md:left-[12rem] md:block"
			>
				<div className="text-tooltip font-slab py-4 text-center text-xl">
					<div className="font-semibold">Settings & Profile</div>
					<div className="text-sm">API keys, dark mode</div>
				</div>
			</div>

			{/* Arrows for small screens */}
			<div className="animate-fade-in block md:hidden">
				<Xarrow
					start="input-help-text"
					end="mobile-input-target"
					startAnchor="bottom"
					endAnchor="top"
					color="var(--color-tooltip)"
					strokeWidth={4}
					curveness={0.5}
					showHead={true}
					animateDrawing={true}
					headSize={4}
					tailSize={0}
				/>

				<Xarrow
					start="menu-help-text"
					end="mobile-menu-target"
					startAnchor="left"
					endAnchor="right"
					color="var(--color-tooltip)"
					strokeWidth={4}
					curveness={0.6}
					showHead={true}
					animateDrawing={true}
					headSize={4}
					tailSize={0}
				/>
			</div>

			{/* Arrows for medium+ screens */}
			<div className="animate-fade-in hidden md:block">
				<Xarrow
					start="chat-history-text"
					end="chat-history-target"
					startAnchor="left"
					endAnchor="bottom"
					color="var(--color-tooltip)"
					strokeWidth={4}
					curveness={0.6}
					showHead={true}
					animateDrawing={true}
					headSize={4}
					tailSize={0}
				/>

				<Xarrow
					start="input-text"
					end="input-area-target"
					startAnchor="bottom"
					endAnchor="top"
					color="var(--color-tooltip)"
					strokeWidth={4}
					curveness={0.6}
					showHead={true}
					animateDrawing={true}
					headSize={4}
					tailSize={0}
				/>

				<Xarrow
					start="settings-text"
					end="settings-target"
					startAnchor="bottom"
					endAnchor="bottom"
					color="var(--color-tooltip)"
					strokeWidth={4}
					curveness={0.7}
					showHead={true}
					animateDrawing={true}
					headSize={4}
					tailSize={0}
				/>
			</div>
		</div>
	);
};
