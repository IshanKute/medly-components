import { WithStyle } from '@medly-components/utils';
import React, { FC } from 'react';
import Caution292LineIconSvg from '../../assets/GSDD/Caution_292_Line.svg';
import SvgIcon, { SvgIconProps } from '../../SvgIcon';

const Component: FC<SvgIconProps> = React.memo(props => {
    const { size, withHoverEffect, color, margin, ...restProps } = props;
    return (
        <SvgIcon {...{ size, withHoverEffect, color, margin, ...restProps }}>
            <Caution292LineIconSvg {...restProps} width="1em" height="1em" />
        </SvgIcon>
    );
});
Component.displayName = 'Caution292LineIcon';

const Caution292LineIcon: FC<SvgIconProps> & WithStyle = Object.assign(Component, { Style: SvgIcon })

export default Caution292LineIcon
